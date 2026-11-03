'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMap, useMapEvents } from 'react-leaflet';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import {
  findSharedStretches,
  pathLength,
  routeThroughWaypoints,
  snapToRoads,
  snapToRoadsBest,
  WAYPOINT_SNAP_RADIUS_M,
  type LatLng,
  type RoadRoute,
} from '@/services/routeGeometry';
import type { VehicleLocationPayload } from '@/types/transport';
import 'leaflet/dist/leaflet.css';

// Dynamic imports with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
// FIX: a stop only snaps to a road within 50 m. 200 m let stops jump to the wrong road.
const SNAP_RADIUS_METERS = 50;

// FIX: automatic routing picks the best road route itself (no drawing needed).
// For each route it asks the router for several options and keeps the shortest one:
//   - stops in the saved order, and in reverse order (campus roads are one-way)
//   - the best visiting order for a loop (OSRM "trip" service)
//   - car roads first; bike roads only when the campus roads are closed to cars
// Footpaths are never used, and legs are never replaced by straight lines.
const ROUTING_SERVER = 'https://routing.openstreetmap.de';
// Prefer car roads, but use bike roads when the car route is more than 15% longer
// (the car router is avoiding a campus lane the shuttle can use).
const CAR_BLOCKED_RATIO = 1.15;
// FIX: a route that passes through every stop always wins, even when one-way roads make
// it long. The hand-drawn line is only used when the routing server can't be reached,
// because it doesn't pass through the stops. Long routes are logged so you can check them.
const LONG_ROUTE_WARN_RATIO = 3;
// Results are saved in the browser so the router is asked only once per route.
// (v3: older saved results are ignored automatically.)
const AUTO_ROUTE_KEY = 'shuttle-auto-routes-v3';

// FIX: stops saved inside a building (e.g. Cafeteria) are moved onto the nearest road
// the shuttle can drive on. Only the map changes; the saved stop data is untouched.
const SNAP_STOPS_TO_ROAD = true;
// A stop further than this from any drivable road is left where it is
const MAX_STOP_SNAP_M = 80;
const STOP_SNAP_KEY = 'shuttle-stop-snap-v1';

/** Nearest point on a drivable road, or null if none is close enough / server down. */
async function nearestRoadPoint(lat: number, lng: number): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `${ROUTING_SERVER}/routed-car/nearest/v1/driving/${lng},${lat}?number=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const wp = json?.waypoints?.[0];
    if (json?.code !== 'Ok' || !wp?.location || !(wp.distance <= MAX_STOP_SNAP_M)) return null;
    const [roadLng, roadLat] = wp.location;
    return [Number(roadLat), Number(roadLng)];
  } catch {
    return null;
  }
}

// FIX: shuttles drive a loop, so the last stop routes back to the first one.
// Set to false if your routes are one-way (A -> B only).
const LOOP_ROUTES = true;

type RoutePath = {
  positions: LatLng[];
  // stored   = geometry saved in your DB (best)
  // osrm     = routed on roads through the stops by OSRM
  // fallback = hand-drawn line below, used only when the route has no stops
  // straight = routing failed, plain lines between stops
  source: 'stored' | 'osrm' | 'fallback' | 'straight';
};

// ---- Snap hand-drawn lines onto the real roads/paths ----
const SNAP_TO_ROADS = true; // set to false to use your drawn points only
const SNAP_KEY = 'shuttle-snapped-routes-v4';

function hashPoints(pts: LatLng[]): string {
  let h = 5381;
  const str = JSON.stringify(pts);
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

// Shared between effect runs so a re-run waits for the same answer instead of
// asking again. Failed requests aren't retried until the page reloads.
const snapRequests = new Map<string, Promise<LatLng[] | null>>();

function snapOnce(fingerprint: string, pts: LatLng[]): Promise<LatLng[] | null> {
  let request = snapRequests.get(fingerprint);
  if (!request) {
    request = snapToRoads(pts);
    snapRequests.set(fingerprint, request);
  }
  return request;
}

const STORAGE_KEY = 'shuttle-custom-routes-v2';
// The clicked points behind each route drawn on roads, kept so the route can be edited.
// Routes listed here are already road geometry and don't need snapping.
const WAYPOINTS_KEY = 'shuttle-route-waypoints-v1';
const MAX_EDITABLE_WAYPOINTS = 100;
const MIN_WAYPOINT_SPACING_M = 2; // ignores the second click of a double-click
const ROUTE_DEBOUNCE_MS = 300; // quick clicks share one request to the public OSRM server

function readSavedWaypoints(): Record<string, LatLng[]> {
  try {
    return JSON.parse(localStorage.getItem(WAYPOINTS_KEY) || '{}');
  } catch {
    return {};
  }
}

// The real shuttle paths at the university, drawn point by point along the roads.
// With USE_DRAWN_ROUTES on, these are shown EXACTLY as drawn: no road snapping and no
// automatic routing, because the router moves them onto the wrong roads.
// To change a path, edit its points here ([lat, lng], in driving order).
const USE_DRAWN_ROUTES = true;

// ---- Presentation look ----
// Slightly softer map colors so the colored routes stand out
// (set to false for the full-color map)
const CLEAN_BASEMAP = true;
// Moving dots along each route that show the driving direction
const ANIMATE_ROUTES = true;
// Show each stop's name next to its marker
const SHOW_STOP_LABELS = true;

// FIX: the online database has these stops in slightly different places from where the
// shuttle really stops, so their pins didn't sit on the route lines. The map shows them
// at these positions instead ([lat, lng]). Only this dashboard changes; the stop data in
// the database is untouched. Remove a line once the database has the right position.
const STOP_POSITION_OVERRIDES: Record<string, LatLng> = {
  S01: [13.96472, 100.58782], // Main Gate
  S03: [13.9656, 100.58665], // Library
  S05: [13.96505, 100.58615], // Cafeteria
};
// Straighten the drawn routes: small wobbles under this many meters are removed, so each
// route runs in clean straight lines from corner to corner. 0 = show the points as drawn.
const STRAIGHTEN_TOLERANCE_M = 6;

/** Douglas-Peucker line simplification in meters (keeps the corners, drops the wobble). */
function straightenPath(pts: LatLng[], toleranceM: number): LatLng[] {
  if (toleranceM <= 0 || pts.length < 3) return pts;
  const lat0 = pts[0][0];
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110540;
  const xy = pts.map(([lat, lng]) => [lng * kx, lat * ky]);
  const keep = new Array<boolean>(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;

  const stack: Array<[number, number]> = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = xy[a];
    const [bx, by] = xy[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let maxDist = -1;
    let maxIdx = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = xy[i];
      const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }
    if (maxDist > toleranceM && maxIdx > 0) {
      keep[maxIdx] = true;
      stack.push([a, maxIdx], [maxIdx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}
const ROUTE_GEOMETRY: Record<string, LatLng[]> = {
  R01: [
    [13.964744, 100.587739],
    [13.964703, 100.587632],
    [13.964698, 100.587562],
    [13.964567, 100.587584],
    [13.964442, 100.587584],
    [13.96426, 100.587573],
    [13.964156, 100.587471],
    [13.964088, 100.587316],
    [13.964021, 100.58708],
    [13.963953, 100.586768],
    [13.963896, 100.586586],
    [13.963854, 100.586398],
    [13.963849, 100.58628],
    [13.963979, 100.586216],
    [13.964198, 100.586146],
    [13.964479, 100.586066],
    [13.96463, 100.58605],
    [13.964812, 100.586012],
    [13.964864, 100.586103],
    [13.964927, 100.586136],
  ],
  R02: [
    [13.965702, 100.586602],
    [13.965832, 100.586549],
    [13.965937, 100.586516],
    [13.966077, 100.586479],
    [13.966192, 100.586441],
    [13.966218, 100.586339],
    [13.96614, 100.58598],
    [13.966082, 100.585717],
    [13.966176, 100.585653],
    [13.966384, 100.585605],
    [13.96652, 100.585637],
    [13.966618, 100.585953],
    [13.966686, 100.586205],
    [13.966764, 100.5865],
    [13.966811, 100.586667],
    [13.966514, 100.586822],
    [13.966317, 100.586913],
    [13.966077, 100.587181],
    [13.965765, 100.587316],
    [13.965465, 100.587362],
    [13.965236, 100.587373],
    [13.964924, 100.58748],
    [13.964726, 100.587587],
  ],
  R03: [
    [13.964869, 100.586157],
    [13.964859, 100.586044],
    [13.964869, 100.585985],
    [13.965046, 100.585921],
    [13.965208, 100.585894],
    [13.965291, 100.585857],
    [13.965265, 100.585701],
    [13.965255, 100.58561],
    [13.965411, 100.585572],
    [13.965536, 100.585535],
    [13.965583, 100.58553],
    [13.965666, 100.585513],
    [13.965817, 100.585481],
    [13.965853, 100.585567],
    [13.965838, 100.585717],
    [13.966025, 100.585696],
    [13.966145, 100.585642],
    [13.966311, 100.585605],
    [13.966436, 100.585562],
    [13.966525, 100.585578],
    [13.966624, 100.585959],
    [13.966702, 100.586211],
    [13.966764, 100.586495],
    [13.966816, 100.586709],
    [13.966676, 100.58679],
    [13.966384, 100.586838],
    [13.966259, 100.586565],
    [13.966238, 100.58642],
    [13.965999, 100.586522],
    [13.965728, 100.586613],
  ],
};

// Lets you click points on the map while drawing a route
function DrawClickHandler({ onAdd }: { onAdd: (p: LatLng) => void }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      onAdd([e.latlng.lat, e.latlng.lng]);
    },
  });
  useEffect(() => {
    const el = map.getContainer();
    el.style.cursor = 'crosshair';
    map.doubleClickZoom.disable();
    return () => {
      el.style.cursor = '';
      map.doubleClickZoom.enable();
    };
  }, [map]);
  return null;
}

function AutoFitView({ points }: { points: LatLng[] }) {
  const map = useMap();
  // Only refit when the set of points really changes, not on every re-render
  const key = useMemo(() => hashPoints(points), [points]);
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 18 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

type RenderableRoute = {
  id: string;
  color: string;
  positions: LatLng[];
  dashArray?: string;
};

// Lines get thinner as the map zooms out so nearby roads don't merge into one blob
function routeWeight(zoom: number): number {
  return Math.max(3, Math.min(7, zoom - 11));
}

const ROUTE_LINE_OPTIONS = { lineJoin: 'round', lineCap: 'round' } as const;
// Leaflet's default of 1 drops the small real bends in a road
const ROUTE_SMOOTH_FACTOR = 0.25;

function RouteLines({ routes }: { routes: RenderableRoute[] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({
    zoomend() {
      setZoom(map.getZoom());
    },
  });

  // Where two routes share a road, draw one line in both colors: the lower route
  // as the outer band and the upper route as a thin core
  const sharedStretches = useMemo(
    () =>
      routes.flatMap((upper, upperIndex) =>
        routes.slice(0, upperIndex).flatMap((lower) => {
          if (upper.dashArray || lower.dashArray) return [];
          return findSharedStretches(upper.positions, lower.positions).map((positions, i) => ({
            key: `${lower.id}-${upper.id}-${i}`,
            outerColor: lower.color,
            coreColor: upper.color,
            positions,
          }));
        })
      ),
    [routes]
  );

  const weight = routeWeight(zoom);

  // Leaflet stacks lines in the order they were added, so a change to the set of
  // routes remounts them all to keep every outline beneath every colored line.
  return (
    <React.Fragment key={routes.map((route) => route.id).join('|')}>
      {routes.map((route) => (
        <Polyline
          key={`${route.id}-outline`}
          positions={route.positions}
          interactive={false}
          smoothFactor={ROUTE_SMOOTH_FACTOR}
          pathOptions={{
            ...ROUTE_LINE_OPTIONS,
            color: '#ffffff',
            weight: weight + 3,
            opacity: 0.85,
            dashArray: route.dashArray,
          }}
        />
      ))}
      {routes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.positions}
          interactive={false}
          smoothFactor={ROUTE_SMOOTH_FACTOR}
          pathOptions={{
            ...ROUTE_LINE_OPTIONS,
            color: route.color,
            weight,
            opacity: 1,
            dashArray: route.dashArray,
          }}
        />
      ))}
      {sharedStretches.map((stretch) => (
        <Polyline
          key={`${stretch.key}-outer`}
          positions={stretch.positions}
          interactive={false}
          smoothFactor={ROUTE_SMOOTH_FACTOR}
          pathOptions={{ ...ROUTE_LINE_OPTIONS, color: stretch.outerColor, weight, opacity: 1 }}
        />
      ))}
      {sharedStretches.map((stretch) => (
        <Polyline
          key={`${stretch.key}-core`}
          positions={stretch.positions}
          interactive={false}
          smoothFactor={ROUTE_SMOOTH_FACTOR}
          pathOptions={{
            ...ROUTE_LINE_OPTIONS,
            color: stretch.coreColor,
            weight: Math.max(2, Math.round(weight * 0.4)),
            opacity: 1,
          }}
        />
      ))}
      {ANIMATE_ROUTES &&
        routes
          .filter((route) => !route.dashArray)
          .map((route) => (
            <Polyline
              key={`${route.id}-flow`}
              positions={route.positions}
              interactive={false}
              smoothFactor={ROUTE_SMOOTH_FACTOR}
              pathOptions={{
                ...ROUTE_LINE_OPTIONS,
                color: '#ffffff',
                weight: Math.max(2, weight - 3),
                opacity: 0.95,
                dashArray: '1 18',
                className: 'route-flow',
              }}
            />
          ))}
    </React.Fragment>
  );
}

interface AdminFleetMapProps {
  stops?: MapStop[];
  routes?: any[];
}

interface MapStop {
  id?: string;
  name?: string;
  nameEn?: string;
  nameTh?: string;
  lat?: number | string;
  lng?: number | string;
  latitude?: number | string;
  longitude?: number | string;
}

/**
 * Reads route geometry that is already stored in your database.
 * Accepts a GeoJSON LineString / MultiLineString / Feature (object or JSON string)
 * and returns Leaflet [lat, lng] pairs. Returns null if nothing usable.
 */
function parseStoredGeometry(route: any): LatLng[] | null {
  let raw = route?.geometry ?? route?.path ?? route?.geojson ?? null;
  if (!raw) return null;

  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (raw.type === 'Feature') raw = raw.geometry;
  if (!raw?.coordinates) return null;

  let lngLat: number[][] = [];
  if (raw.type === 'LineString') {
    lngLat = raw.coordinates;
  } else if (raw.type === 'MultiLineString') {
    lngLat = raw.coordinates.flat();
  } else {
    return null;
  }

  const positions = lngLat
    .map(([lng, lat]) => [Number(lat), Number(lng)] as LatLng)
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

  return positions.length > 1 ? positions : null;
}

type RoadCandidate = { positions: LatLng[]; meters: number };

/**
 * One request to the routing server through all the given stops.
 * service 'route' keeps the given order; 'trip' finds the best order for a loop.
 */
async function osrmRequest(
  profile: 'car' | 'bike',
  service: 'route' | 'trip',
  stops: LatLng[],
  extra: string
): Promise<RoadCandidate | null> {
  const coords = stops.map(([lat, lng]) => `${lng},${lat}`).join(';'); // OSRM wants lng,lat
  const radiuses = stops.map(() => SNAP_RADIUS_METERS).join(';');
  const url =
    `${ROUTING_SERVER}/routed-${profile}/${service}/v1/driving/${coords}` +
    `?overview=full&geometries=geojson&radiuses=${radiuses}${extra}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code !== 'Ok') return null;
    const result = service === 'trip' ? json.trips?.[0] : json.routes?.[0];
    const line: number[][] | undefined = result?.geometry?.coordinates;
    if (!line || line.length < 2 || !Number.isFinite(result.distance)) return null;
    return {
      positions: line.map(([lng, lat]) => [lat, lng] as LatLng),
      meters: result.distance,
    };
  } catch (err) {
    console.warn(`Routing request failed (${profile} ${service}):`, err);
    return null;
  }
}

/** Shortest of: saved order, reverse order and (for loops) the best order. */
async function bestForProfile(profile: 'car' | 'bike', stops: LatLng[]): Promise<RoadCandidate | null> {
  const loop = LOOP_ROUTES && stops.length >= 2;
  const forward = loop ? [...stops, stops[0]] : stops;
  const backward = loop
    ? [stops[0], ...stops.slice(1).reverse(), stops[0]]
    : [...stops].reverse();

  const candidates: RoadCandidate[] = [];
  for (const attempt of [
    () => osrmRequest(profile, 'route', forward, '&continue_straight=false'),
    () => osrmRequest(profile, 'route', backward, '&continue_straight=false'),
    () => (loop ? osrmRequest(profile, 'trip', stops, '&roundtrip=true&source=first') : Promise.resolve(null)),
  ]) {
    const c = await attempt(); // one at a time, to be polite to the public server
    if (c) candidates.push(c);
  }
  candidates.sort((x, y) => x.meters - y.meters);
  return candidates[0] ?? null;
}

/** Best road route through the stops, or null if the routing server can't be reached. */
async function bestRoadRoute(stops: LatLng[]): Promise<LatLng[] | null> {
  const car = await bestForProfile('car', stops);
  const bike = await bestForProfile('bike', stops);
  let best: RoadCandidate | null = car ?? bike;
  if (car && bike && car.meters > bike.meters * CAR_BLOCKED_RATIO) best = bike;
  if (best) {
    const loop = LOOP_ROUTES && stops.length >= 2;
    const direct = pathLength(loop ? [...stops, stops[0]] : stops);
    if (direct > 0 && best.meters > direct * LONG_ROUTE_WARN_RATIO) {
      console.warn(
        `Auto route is long: ${Math.round(best.meters)} m of road for stops ` +
          `${Math.round(direct)} m apart. One-way roads force this; check the stop positions.`
      );
    }
    console.info(
      `Auto route: ${best === car ? 'car' : 'bike'} roads, ${Math.round(best.meters)} m` +
        (car && bike ? ` (car ${Math.round(car.meters)} m, bike ${Math.round(bike.meters)} m)` : '')
    );
  }
  return best?.positions ?? null;
}

function readAutoRoutes(): Record<string, LatLng[]> {
  try {
    return JSON.parse(localStorage.getItem(AUTO_ROUTE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAutoRoute(key: string, positions: LatLng[]) {
  try {
    localStorage.setItem(AUTO_ROUTE_KEY, JSON.stringify({ ...readAutoRoutes(), [key]: positions }));
  } catch {
    /* ignore */
  }
}

export default function AdminFleetMap({ stops = [], routes = [] }: AdminFleetMapProps) {
  const [vehicles, setVehicles] = useState<Record<string, VehicleLocationPayload>>({});
  const [connected, setConnected] = useState(false);
  const [LInstance, setLInstance] = useState<typeof import('leaflet') | null>(null);
  const [routePaths, setRoutePaths] = useState<Record<string, RoutePath>>({});
  const [activeRouteFilter, setActiveRouteFilter] = useState<string>('ALL');
  // FIX: start empty. Only routes YOU draw and save with the Draw tool go here now,
  // so the hand-drawn defaults no longer override the stop-based routes.
  const [customPaths, setCustomPaths] = useState<Record<string, LatLng[]>>({});
  const [drawRouteId, setDrawRouteId] = useState<string | null>(null);
  const [draftPoints, setDraftPoints] = useState<LatLng[]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<Record<string, LatLng[]>>(readSavedWaypoints);
  const [draftRoute, setDraftRoute] = useState<{ key: string; result: RoadRoute } | null>(null);
  const [lastRoadLine, setLastRoadLine] = useState<LatLng[] | null>(null);
  const [routingAttempt, setRoutingAttempt] = useState(0);
  const [copied, setCopied] = useState(false);

  const draftKey = useMemo(() => JSON.stringify(draftPoints), [draftPoints]);

  // Route all the waypoints in one request. A newer edit cancels the one before it, and
  // an answer only counts for the exact points it was asked about.
  useEffect(() => {
    if (!drawRouteId || draftPoints.length < 2) return;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const result = await routeThroughWaypoints(draftPoints, controller.signal);
      if (controller.signal.aborted) return;
      setDraftRoute({ key: JSON.stringify(draftPoints), result });
      if (result.status === 'routed') setLastRoadLine(result.positions);
    }, ROUTE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [drawRouteId, draftPoints, routingAttempt]);

  const currentRoute = draftRoute?.key === draftKey ? draftRoute.result : undefined;
  const draftPending = draftPoints.length >= 2 && !currentRoute;

  // Null until the whole route follows roads, which is what keeps Save and Copy JSON off
  const draftGeometry = currentRoute?.status === 'routed' ? currentRoute.positions : null;
  const badWaypoint = currentRoute?.status === 'no-road' ? currentRoute.waypoint : null;
  const draftBlocked = currentRoute !== undefined && currentRoute.status !== 'routed';
  const draftChecks = currentRoute?.status === 'routed' ? currentRoute : null;
  const draftHasNotice = Boolean(draftChecks?.longSections.length || draftChecks?.farWaypoints.length);

  // Road-snapped versions of the drawn lines, keyed by a fingerprint of the drawn points
  const [snapped, setSnapped] = useState<Record<string, LatLng[]>>({});

  useEffect(() => {
    if (!SNAP_TO_ROADS) return;
    let cancelled = false;
    let cache: Record<string, LatLng[]> = {};
    try {
      cache = JSON.parse(localStorage.getItem(SNAP_KEY) || '{}');
    } catch {
      cache = {};
    }

    (async () => {
      for (const [id, pts] of Object.entries(customPaths)) {
        if (pts.length < 2 || routeWaypoints[id]) continue;
        const fp = `${id}:${hashPoints(pts)}`;
        let result: LatLng[] | null = cache[fp] ?? null;
        if (!result) {
          result = await snapOnce(fp, pts);
          if (result) {
            cache[fp] = result;
            try {
              localStorage.setItem(SNAP_KEY, JSON.stringify(cache));
            } catch {
              /* ignore */
            }
          }
        }
        if (cancelled) return;
        if (result) {
          const good = result;
          setSnapped((prev) => ({ ...prev, [fp]: good }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customPaths, routeWaypoints]);

  // Lines used for display: road-following if available, otherwise the drawn points.
  const displayPaths = useMemo(() => {
    const out: Record<string, LatLng[]> = {};
    Object.entries(customPaths).forEach(([id, pts]) => {
      const onRoad = snapped[`${id}:${hashPoints(pts)}`];
      out[id] = onRoad ?? pts;
    });
    return out;
  }, [customPaths, snapped]);

  // Load routes drawn earlier in this browser
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCustomPaths((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
  }, []);

  const persistCustom = (next: Record<string, LatLng[]>) => {
    setCustomPaths(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const persistWaypoints = (next: Record<string, LatLng[]>) => {
    setRouteWaypoints(next);
    try {
      localStorage.setItem(WAYPOINTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const startDraw = (id: string, points: LatLng[] = []) => {
    setDrawRouteId(id);
    setDraftPoints(points);
    setDraftRoute(null);
    setLastRoadLine(null);
    setCopied(false);
  };

  const cancelDraw = () => {
    setDrawRouteId(null);
    setDraftPoints([]);
    setDraftRoute(null);
    setLastRoadLine(null);
  };

  const saveDraw = () => {
    if (!drawRouteId || !draftGeometry) return;
    persistCustom({ ...customPaths, [drawRouteId]: draftGeometry });
    persistWaypoints({ ...routeWaypoints, [drawRouteId]: draftPoints });
    cancelDraw();
  };

  const removeSaved = (id: string) => {
    const next = { ...customPaths };
    delete next[id];
    persistCustom(next);
    const nextWaypoints = { ...routeWaypoints };
    delete nextWaypoints[id];
    persistWaypoints(nextWaypoints);
  };

  const addDraftPoint = (pt: LatLng) => {
    setDraftPoints((prev) => {
      const last = prev[prev.length - 1];
      return last && pathLength([last, pt]) < MIN_WAYPOINT_SPACING_M ? prev : [...prev, pt];
    });
  };

  const moveDraftPoint = (index: number, pt: LatLng) => {
    setDraftPoints((prev) => prev.map((p, i) => (i === index ? pt : p)));
  };

  const removeDraftPoint = (index: number) => {
    if (draftPoints.length <= 2) setLastRoadLine(null);
    setDraftPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const undoDraftPoint = () => {
    if (draftPoints.length <= 2) setLastRoadLine(null);
    setDraftPoints((prev) => prev.slice(0, -1));
  };

  const clearDraft = () => {
    setDraftPoints([]);
    setDraftRoute(null);
    setLastRoadLine(null);
  };

  const retryRouting = () => {
    setDraftRoute(null);
    setRoutingAttempt((n) => n + 1);
  };

  const copyJson = async () => {
    const id = drawRouteId ?? activeRouteFilter;
    const pts = drawRouteId
      ? draftGeometry ?? []
      : customPaths[id] || routePaths[id]?.positions || [];
    const text = JSON.stringify({
      routeId: id,
      coordinates: pts.map(([lat, lng]) => [Number(lng.toFixed(6)), Number(lat.toFixed(6))]),
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      window.prompt('Copy this text:', text);
    }
  };

  // Cache OSRM answers so re-renders never trigger duplicate requests
  const osrmCache = useRef<Map<string, LatLng[] | null>>(new Map());

  useEffect(() => {
    let isCurrent = true;
    let socket: Socket | null = null;

    import('leaflet').then((mod) => {
      if (isCurrent) setLInstance(mod.default || mod);
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onLocation = (data: VehicleLocationPayload) => {
      if (data?.vehicleId) {
        setVehicles((prev) => ({ ...prev, [data.vehicleId]: data }));
      }
    };

    void getSocket()
      .then((authenticatedSocket) => {
        if (!isCurrent) return;
        socket = authenticatedSocket;
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('vehicle:location', onLocation);
        if (socket.connected) setConnected(true);
        socket.connect();
      })
      .catch((error: unknown) => {
        if (isCurrent) console.error('Unable to initialize fleet map socket:', error);
      });

    return () => {
      isCurrent = false;
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('vehicle:location', onLocation);
    };
  }, []);

  // Normalize master stops
  const validStops = useMemo(() => {
    return (stops || [])
      .map((s, idx) => {
        const override = s.id ? STOP_POSITION_OVERRIDES[s.id] : undefined;
        const lat = override ? override[0] : Number(s.lat ?? s.latitude);
        const lng = override ? override[1] : Number(s.lng ?? s.longitude);
        const name = s.nameEn || s.nameTh || s.name || `Stop ${idx + 1}`;

        return {
          id: s.id || `stop-${idx}`,
          name,
          lat,
          lng,
        };
      })
      .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng) && s.lat !== 0 && s.lng !== 0);
  }, [stops]);

  // Road positions for stops saved inside buildings, keyed by `${id}|${lat},${lng}`
  const [stopRoadPoints, setStopRoadPoints] = useState<Record<string, LatLng>>({});
  const [stopsReady, setStopsReady] = useState(!SNAP_STOPS_TO_ROAD);

  useEffect(() => {
    if (!SNAP_STOPS_TO_ROAD) return;
    if (validStops.length === 0) {
      setStopsReady(true);
      return;
    }
    let cancelled = false;
    setStopsReady(false);

    let cache: Record<string, LatLng> = {};
    try {
      cache = JSON.parse(localStorage.getItem(STOP_SNAP_KEY) || '{}');
    } catch {
      cache = {};
    }

    (async () => {
      const found: Record<string, LatLng> = {};
      for (const s of validStops) {
        const key = `${s.id}|${s.lat},${s.lng}`;
        let point: LatLng | null = cache[key] ?? null;
        if (!point) {
          point = await nearestRoadPoint(s.lat, s.lng);
          if (point) {
            cache[key] = point;
            console.info(
              `Stop ${s.name}: moved ${Math.round(pathLength([[s.lat, s.lng], point]))} m onto the road`
            );
          }
        }
        if (cancelled) return;
        if (point) found[key] = point;
      }
      try {
        localStorage.setItem(STOP_SNAP_KEY, JSON.stringify(cache));
      } catch {
        /* ignore */
      }
      setStopRoadPoints(found);
      setStopsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [validStops]);

  // Stops as shown on the map and used for routing: on the road when possible
  const displayStops = useMemo(
    () =>
      validStops.map((s) => {
        const road = stopRoadPoints[`${s.id}|${s.lat},${s.lng}`];
        return road ? { ...s, lat: road[0], lng: road[1], savedLat: s.lat, savedLng: s.lng } : s;
      }),
    [validStops, stopRoadPoints]
  );

  // Coordinate lookup map
  const stopCoordinatesMap = useMemo(() => {
    const map = new Map<string, LatLng>();
    displayStops.forEach((s) => {
      if (s.id) map.set(String(s.id), [s.lat, s.lng]);
    });
    return map;
  }, [displayStops]);

  // Build each route's path:
  // 1) geometry stored in the DB  2) OSRM through the route's stops
  // 3) hand-drawn fallback line   4) straight lines between stops
  useEffect(() => {
    if (!routes || routes.length === 0 || !stopsReady) return;

    let cancelled = false;

    const setPath = (routeId: string, path: RoutePath) => {
      if (!cancelled) setRoutePaths((prev) => ({ ...prev, [routeId]: path }));
    };

    // Hand-drawn line from ROUTE_GEOMETRY, snapped to roads when possible
    const applyFallback = async (routeId: string): Promise<boolean> => {
      const fallback = ROUTE_GEOMETRY[routeId];
      if (!fallback || fallback.length < 2) return false;
      // Tries car roads, then bike roads, and keeps the one with fewer straight links
      const onRoad = SNAP_TO_ROADS ? await snapToRoadsBest(fallback) : null;
      setPath(routeId, { positions: onRoad ?? fallback, source: 'fallback' });
      return true;
    };

    const loadStopCoords = async (routeId: string): Promise<LatLng[]> => {
      if (stopCoordinatesMap.size === 0) return [];
      try {
        const res = await fetch(`${API_BASE}/api/routes/${routeId}/stops`);
        if (!res.ok) {
          console.warn(`Stops request for ${routeId} failed with`, res.status);
          return [];
        }
        const data = await res.json();
        const rawList: any[] = Array.isArray(data) ? data : data.data || data.stops || [];

        const sortedStops = [...rawList].sort(
          (a, b) =>
            Number(a.stopOrder ?? a.sequence ?? a.order ?? 0) -
            Number(b.stopOrder ?? b.sequence ?? b.order ?? 0)
        );

        const coords: LatLng[] = [];
        sortedStops.forEach((item) => {
          // Try every plausible ID field and keep the first one that matches a master stop.
          // item.id is last because it is often the join-row ID, not the stop ID.
          const candidates = [item.stopId, item.stop?.id, item.stop_id, item.id];
          for (const c of candidates) {
            if (c == null) continue;
            const coord = stopCoordinatesMap.get(String(c));
            if (coord) {
              coords.push(coord);
              return;
            }
          }
          // Some APIs return the coordinates directly on the row
          const lat = Number(item.lat ?? item.latitude ?? item.stop?.lat ?? item.stop?.latitude);
          const lng = Number(item.lng ?? item.longitude ?? item.stop?.lng ?? item.stop?.longitude);
          if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
            coords.push([lat, lng]);
            return;
          }
          console.warn(`Route ${routeId}: could not match stop`, item);
        });
        return coords;
      } catch (err) {
        console.warn(`Could not load stops for ${routeId}:`, err);
        return [];
      }
    };

    const buildRoute = async (route: any) => {
      const routeId: string | undefined = route?.id;
      if (!routeId) return;

      // Drawn paths are shown as they are (see renderableRoutes); nothing to compute
      if (USE_DRAWN_ROUTES && ROUTE_GEOMETRY[routeId]) return;

      // 1) Geometry already stored on the route: use it exactly as is
      const stored = parseStoredGeometry(route);
      if (stored) {
        setPath(routeId, { positions: stored, source: 'stored' });
        return;
      }

      // 2) Build from the ordered stops
      const stopCoords = await loadStopCoords(routeId);
      if (cancelled) return;

      if (stopCoords.length < 2) {
        // 3) No stops assigned: use the hand-drawn line
        if (!(await applyFallback(routeId))) {
          console.warn(`Route ${routeId} has fewer than 2 stops and no fallback line`);
        }
        return;
      }

      // Pick the best road route automatically (cached in memory and in the browser)
      const cacheKey = `${routeId}|${LOOP_ROUTES}|` + stopCoords.map(([x, y]) => `${x},${y}`).join('|');
      let onRoad: LatLng[] | null = null;
      if (osrmCache.current.has(cacheKey)) {
        onRoad = osrmCache.current.get(cacheKey) ?? null;
      } else {
        onRoad = readAutoRoutes()[cacheKey] ?? null;
        if (!onRoad) {
          onRoad = await bestRoadRoute(stopCoords);
          if (onRoad) saveAutoRoute(cacheKey, onRoad);
        }
        osrmCache.current.set(cacheKey, onRoad);
      }
      if (cancelled) return;

      if (onRoad) {
        setPath(routeId, { positions: onRoad, source: 'osrm' });
      } else if (!(await applyFallback(routeId))) {
        // Routing server unreachable and no fallback line: dashed lines between the stops
        const closed = LOOP_ROUTES ? [...stopCoords, stopCoords[0]] : stopCoords;
        setPath(routeId, { positions: closed, source: 'straight' });
      }
    };

    // Run one route at a time to stay friendly to the public OSRM server
    (async () => {
      for (const route of routes) {
        if (cancelled) break;
        await buildRoute(route);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routes, stopCoordinatesMap, stopsReady]);

  const validVehicles = Object.values(vehicles).filter(
    (v) => v && !isNaN(Number(v.lat)) && !isNaN(Number(v.lng))
  );

  const getVehicleIcon = (v: VehicleLocationPayload) => {
    if (!LInstance) return undefined;
    return LInstance.divIcon({
      className: 'custom-vehicle-icon',
      html: `
        <div style="
          background-color: #2563eb;
          color: white;
          width: 60px;
          height: 36px;
          box-sizing: border-box;
          justify-content: center;
          border-radius: 8px;
          font-weight: 700;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.5);
          white-space: nowrap;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.5s ease-out;
        ">
          <div>🚍 ${v.vehicleId}</div>
          <div style="font-size: 9px; opacity: 0.9;">${v.speed ?? 0} km/h</div>
        </div>
      `,
      iconSize: [60, 36],
      iconAnchor: [30, 18],
    });
  };

  const getStopIcon = (name: string) => {
    if (!LInstance) return undefined;
    const safeName = name.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
    const label = SHOW_STOP_LABELS
      ? `<div style="
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: #ffffff;
          color: #0f172a;
          font: 600 11px/1.2 system-ui, -apple-system, sans-serif;
          padding: 3px 7px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 6px rgba(15,23,42,0.25);
          white-space: nowrap;
          pointer-events: none;
        ">${safeName}</div>`
      : '';
    return LInstance.divIcon({
      className: 'custom-stop-icon',
      html: `
        <div title="${safeName}" style="position: relative; width: 16px; height: 16px; cursor: pointer;">
          <div style="
            width: 16px;
            height: 16px;
            box-sizing: border-box;
            border-radius: 50%;
            background: #ffffff;
            border: 4px solid #0f172a;
            box-shadow: 0 2px 6px rgba(15,23,42,0.45);
          "></div>
          ${label}
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const defaultCenter: LatLng =
    validStops.length > 0 ? [validStops[0].lat, validStops[0].lng] : [13.9648691, 100.5881689];

  // Memoized so live vehicle updates don't redraw the route lines
  const renderableRoutes = useMemo<RenderableRoute[]>(
    () =>
      routes
        // Filter routes based on selected toggle
        .filter((r) => (activeRouteFilter === 'ALL' ? true : r.id === activeRouteFilter))
        .flatMap((route) => {
          if (drawRouteId === route.id) return [];
          // A route you drew and saved yourself still wins; otherwise the stop-based route
          // 1) a route you drew and saved in this browser, 2) the drawn path in the code,
          // 3) the automatic route through the stops
          const path: RoutePath | undefined = customPaths[route.id]
            ? { positions: displayPaths[route.id] ?? customPaths[route.id], source: 'stored' }
            : USE_DRAWN_ROUTES && ROUTE_GEOMETRY[route.id]
            ? {
                positions: straightenPath(ROUTE_GEOMETRY[route.id], STRAIGHTEN_TOLERANCE_M),
                source: 'fallback',
              }
            : routePaths[route.id];
          if (!path || path.positions.length < 2) return [];

          return [{
            id: route.id,
            color: route.color || '#2563eb',
            positions: path.positions,
            dashArray: path.source === 'straight' ? '8 10' : undefined,
          }];
        }),
    [routes, activeRouteFilter, drawRouteId, customPaths, displayPaths, routePaths]
  );

  // FIX: fit the view to the routes actually on screen (plus stops)
  const fitPoints = useMemo(() => {
    const routePoints = renderableRoutes.flatMap((r: RenderableRoute) => r.positions);
    const stopPoints = displayStops.map((s) => [s.lat, s.lng] as LatLng);
    if (activeRouteFilter === 'ALL') return [...stopPoints, ...routePoints];
    return routePoints.length > 0 ? routePoints : stopPoints;
  }, [activeRouteFilter, displayStops, renderableRoutes]);

  // One solid road line. While it's being replaced or can't be replaced, the last road
  // line stays as a grey reference. It's never saved, and clicks are never joined straight.
  const draftRoutes = useMemo<RenderableRoute[]>(() => {
    if (!drawRouteId) return [];
    if (draftGeometry) {
      return [{
        id: `${drawRouteId}-draft`,
        color: routes.find((r) => r.id === drawRouteId)?.color || '#2563eb',
        positions: draftGeometry,
      }];
    }
    if (!lastRoadLine) return [];
    return [{ id: `${drawRouteId}-draft-old`, color: '#64748b', positions: lastRoadLine, dashArray: '6 8' }];
  }, [drawRouteId, draftGeometry, lastRoadLine, routes]);

  const waypointIcons = useMemo(() => {
    if (!LInstance) return null;
    const icon = (fill: string) =>
      LInstance.divIcon({
        className: 'draft-waypoint',
        html: `<div style="width:14px;height:14px;box-sizing:border-box;border-radius:50%;background:${fill};border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.5);cursor:grab;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
    return { start: icon('#059669'), next: icon('#111827'), bad: icon('#dc2626') };
  }, [LInstance]);

  const editableWaypoints = routeWaypoints[activeRouteFilter] ?? customPaths[activeRouteFilter];

  return (
    <div className="w-full h-[520px] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl">
      {/* Moving dots along the routes (direction of travel) */}
      <style>{`
        .basemap-soft { filter: saturate(0.75) brightness(1.03); }
        .route-flow { animation: route-flow 1.4s linear infinite; }
        @keyframes route-flow { to { stroke-dashoffset: -38; } }
        @media (prefers-reduced-motion: reduce) { .route-flow { animation: none; } }
      `}</style>
      {/* Top Floating Overlay */}
      <div className="absolute top-4 left-14 right-4 flex justify-between items-center z-[1000] pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 pointer-events-auto shadow-md">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-200 font-medium">
            {connected ? 'Live PostGIS Telemetry' : 'Connecting to Socket...'}
          </span>
        </div>

        {/* Route Selector Filter Buttons */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-1 rounded-lg text-xs flex gap-1 pointer-events-auto shadow-md">
          <button
            onClick={() => setActiveRouteFilter('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              activeRouteFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {routes.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRouteFilter(r.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1.5 ${
                activeRouteFilter === r.id
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: r.color || '#3b82f6' }}
              />
              {r.id}
            </button>
          ))}
          <div className="border-l border-slate-700 mx-1 my-0.5" />
          <span className="px-2 py-1 text-slate-300 font-medium text-[11px]">
            Tracking: <strong className="text-white">{validVehicles.length}</strong>
          </span>
        </div>
      </div>

      {/* Leaflet Surface */}
      <div className="w-full h-full relative z-0">
        {LInstance ? (
          <MapContainer
            center={defaultCenter}
            zoom={15}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '520px' }}
          >
            {/* Normal OpenStreetMap tiles (no API key needed). CLEAN_BASEMAP only adds a
                soft grey filter so the colored routes stand out. */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className={CLEAN_BASEMAP ? 'basemap-soft' : undefined}
            />

            {fitPoints.length > 0 && <AutoFitView points={fitPoints} />}

            <RouteLines routes={renderableRoutes} />

            {/* Route drawing */}
            {drawRouteId && (
              <DrawClickHandler onAdd={addDraftPoint} />
            )}
            {drawRouteId && draftPoints.length > 0 && waypointIcons && (
              <>
                <RouteLines routes={draftRoutes} />
                {draftPoints.map((pt, i) => (
                  <Marker
                    key={i}
                    position={pt}
                    icon={i === badWaypoint ? waypointIcons.bad : i === 0 ? waypointIcons.start : waypointIcons.next}
                    draggable
                    eventHandlers={{
                      // Without a click handler Leaflet passes the click to the map, which adds a point
                      click: () => {},
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        moveDraftPoint(i, [lat, lng]);
                      },
                      dblclick: () => removeDraftPoint(i),
                    }}
                  />
                ))}
              </>
            )}

            {/* Stop Pins */}
            {displayStops.map((s) => {
              const icon = getStopIcon(s.name);
              if (!icon) return null;

              return (
                // Leaflet can't change `interactive` on an existing marker, so remount to
                // let clicks on a pin reach the map while drawing
                <Marker
                  key={`${s.id}-${drawRouteId ? 'drawing' : 'viewing'}`}
                  position={[s.lat, s.lng]}
                  icon={icon}
                  interactive={!drawRouteId}
                >
                  <Popup offset={[0, -8]}>
                    <div className="p-1 text-slate-900">
                      <strong className="text-sm font-semibold text-slate-800">{s.name}</strong>
                      <div className="text-xs text-slate-500 mt-1">
                        Lat: {s.lat.toFixed(5)}, Lng: {s.lng.toFixed(5)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Vehicle Markers */}
            {validVehicles.map((v) => {
              const icon = getVehicleIcon(v);
              if (!icon) return null;

              return (
                <Marker
                  key={v.vehicleId}
                  position={[Number(v.lat), Number(v.lng)]}
                  icon={icon}
                  interactive={true}
                >
                  <Popup offset={[0, -15]}>
                    <div className="p-1 text-slate-900">
                      <strong className="text-sm font-bold text-blue-600">Vehicle {v.vehicleId}</strong>
                      <div className="text-xs mt-1">Speed: {v.speed ?? 0} km/h</div>
                      <div className="text-xs">Heading: {v.heading ?? 0}°</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Initializing Leaflet map...
          </div>
        )}
      </div>

      {/* Route drawing status */}
      {drawRouteId && (
        <div
          role={draftBlocked || draftHasNotice ? 'alert' : 'status'}
          className={`absolute bottom-[104px] right-4 z-[1000] max-w-md backdrop-blur border p-2 rounded-lg text-xs flex items-center gap-2 shadow-md pointer-events-auto ${
            draftBlocked || draftHasNotice
              ? 'bg-amber-950/95 border-amber-600 text-amber-100'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <span>
            {currentRoute?.status === 'unavailable' &&
              "Road routing isn't available right now, so this route can't be saved yet. Your points are safe."}
            {currentRoute?.status === 'no-road' &&
              `Point ${currentRoute.waypoint + 1} has no mapped road within ${WAYPOINT_SNAP_RADIUS_M} m. Drag it onto a road or remove it. If there is a road there, it's missing from the map data. Saving is off until this is fixed.`}
            {currentRoute?.status === 'no-route' &&
              "The mapped roads don't connect these points, often because of a one-way road or a road missing from the map data. Move or remove the last point. Saving is off until this is fixed."}
            {draftPending && 'Finding the road...'}
            {draftChecks?.longSections[0] &&
              `Section ${draftChecks.longSections[0].section} drives ${Math.round(draftChecks.longSections[0].roadMeters)} m of road to cover ${Math.round(draftChecks.longSections[0].directMeters)} m, often because of a one-way road. Check the line before saving. `}
            {draftChecks?.farWaypoints[0] &&
              `Point ${draftChecks.farWaypoints[0].waypoint} is ${Math.round(draftChecks.farWaypoints[0].meters)} m from the road it joined. Check it's the road you meant.`}
            {!draftBlocked && !draftPending && !draftHasNotice &&
              'Drag a point to move it. Double-click a point to remove it.'}
          </span>
          {currentRoute?.status === 'unavailable' && (
            <button
              className="shrink-0 px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-600 text-white hover:bg-amber-500"
              onClick={retryRouting}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Route drawing tool */}
      <div className="absolute bottom-14 right-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg text-xs flex items-center gap-2 shadow-md pointer-events-auto">
        {drawRouteId ? (
          <>
            <span className="text-slate-200 font-medium">
              Drawing {drawRouteId}: {draftPoints.length} points. Click along the road.
            </span>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={undoDraftPoint}>Undo</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={clearDraft}>Clear</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700 disabled:opacity-40" disabled={!draftGeometry} onClick={copyJson}>{copied ? 'Copied' : 'Copy JSON'}</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={cancelDraw}>Cancel</button>
            <button
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-600 text-white disabled:opacity-40"
              disabled={!draftGeometry}
              onClick={saveDraw}
            >
              Save
            </button>
          </>
        ) : activeRouteFilter === 'ALL' ? (
          <span className="text-slate-400">Pick R01, R02 or R03 above to draw its route</span>
        ) : (
          <>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={() => startDraw(activeRouteFilter)}>
              Draw {activeRouteFilter} route
            </button>
            {editableWaypoints && editableWaypoints.length <= MAX_EDITABLE_WAYPOINTS && (
              <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={() => startDraw(activeRouteFilter, editableWaypoints)}>
                Edit {activeRouteFilter} route
              </button>
            )}
            {customPaths[activeRouteFilter] && (
              <>
                <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={copyJson}>{copied ? 'Copied' : 'Copy JSON'}</button>
                <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={() => removeSaved(activeRouteFilter)}>Remove saved line</button>
              </>
            )}
          </>
        )}
      </div>

      {/* Floating Monitored Stops Bar */}
      {validStops.length > 0 && (
        <div className="absolute bottom-3 left-4 max-w-[80%] bg-slate-900/90 backdrop-blur border border-slate-800 p-2 rounded-lg z-[500] flex gap-2 overflow-x-auto text-xs shadow-md pointer-events-auto">
          <span className="text-slate-400 font-medium whitespace-nowrap self-center">
            Monitored Stops:
          </span>
          {validStops.map((s) => (
            <span
              key={s.id}
              className="bg-slate-800 text-slate-300 px-2 py-1 rounded whitespace-nowrap border border-slate-700"
            >
              📍 {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}