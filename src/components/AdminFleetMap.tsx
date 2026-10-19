'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMap, useMapEvents } from 'react-leaflet';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
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
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const OSRM_BASE = 'https://routing.openstreetmap.de/routed-foot/route/v1/driving';
const SNAP_RADIUS_METERS = 200;

type LatLng = [number, number];

type RoutePath = {
  positions: LatLng[];
  // stored  = geometry saved in your DB (best)
  // osrm    = snapped to roads by OSRM
  // straight = routing failed, plain lines between stops
  source: 'stored' | 'osrm' | 'straight';
};

// ---- Path cleanup: makes hand-drawn lines look straight and smooth ----
const SIMPLIFY_METERS = 2; // higher = straighter lines (try 5 for very straight)
const SMOOTH_ITERATIONS = 2; // 0 = sharp corners, 1-2 = softly rounded corners
const SPIKE_ANGLE_DEG = 140; // removes tiny out-and-back jogs

function toMeters(pts: LatLng[]): [number, number][] {
  const [lat0, lng0] = pts[0];
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110540;
  return pts.map(([lat, lng]) => [(lng - lng0) * kx, (lat - lat0) * ky]);
}

function removeSpikes(pts: LatLng[]): LatLng[] {
  if (pts.length < 3) return pts;
  const m = toMeters(pts);
  const out: LatLng[] = [pts[0]];
  let last = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const ax = m[i][0] - m[last][0];
    const ay = m[i][1] - m[last][1];
    const bx = m[i + 1][0] - m[i][0];
    const by = m[i + 1][1] - m[i][1];
    const la = Math.hypot(ax, ay);
    const lb = Math.hypot(bx, by);
    if (la === 0 || lb === 0) continue;
    const cos = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
    const turn = (Math.acos(cos) * 180) / Math.PI;
    if (turn > SPIKE_ANGLE_DEG) continue;
    out.push(pts[i]);
    last = i;
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function perpDist(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

// Douglas-Peucker: drops points that only add wobble
function simplify(pts: LatLng[], tolerance: number): LatLng[] {
  if (pts.length < 3) return pts;
  const m = toMeters(pts);
  const keep = new Array<boolean>(pts.length).fill(false);
  keep[0] = true;
  keep[pts.length - 1] = true;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop() as [number, number];
    let maxD = 0;
    let idx = -1;
    for (let i = start + 1; i < end; i++) {
      const d = perpDist(m[i], m[start], m[end]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (idx !== -1 && maxD > tolerance) {
      keep[idx] = true;
      stack.push([start, idx], [idx, end]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

// Chaikin corner cutting with a small ratio so lines stay on the road
function smooth(pts: LatLng[], iterations: number): LatLng[] {
  let cur = pts;
  for (let it = 0; it < iterations; it++) {
    if (cur.length < 3) break;
    const next: LatLng[] = [cur[0]];
    for (let i = 0; i < cur.length - 1; i++) {
      const [aLat, aLng] = cur[i];
      const [bLat, bLng] = cur[i + 1];
      next.push([0.8 * aLat + 0.2 * bLat, 0.8 * aLng + 0.2 * bLng]);
      next.push([0.2 * aLat + 0.8 * bLat, 0.2 * aLng + 0.8 * bLng]);
    }
    next.push(cur[cur.length - 1]);
    cur = next;
  }
  return cur;
}

function tidyPath(pts: LatLng[]): LatLng[] {
  if (!pts || pts.length < 3) return pts;
  return smooth(simplify(removeSpikes(pts), SIMPLIFY_METERS), SMOOTH_ITERATIONS);
}

// ---- Snap hand-drawn lines onto the real roads/paths (falls back to tidyPath) ----
const SNAP_TO_ROADS = true; // set to false to use your drawn points only
const SNAP_RADIUS_M = 20; // how far (m) a drawn point may be from a real path
const MATCH_BASE = 'https://routing.openstreetmap.de/routed-foot/match/v1/driving';
const SNAP_KEY = 'shuttle-snapped-routes-v1';

function hashPoints(pts: LatLng[]): string {
  let h = 5381;
  const str = JSON.stringify(pts);
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

function pathLength(pts: LatLng[]): number {
  if (pts.length < 2) return 0;
  const m = toMeters(pts);
  let total = 0;
  for (let i = 1; i < m.length; i++) total += Math.hypot(m[i][0] - m[i - 1][0], m[i][1] - m[i - 1][1]);
  return total;
}

// Asks a map-matching service to follow the real paths closest to the drawn points.
// Returns null when anything looks wrong, so the drawn line is used instead.
async function snapToRoads(pts: LatLng[]): Promise<LatLng[] | null> {
  if (pts.length < 2 || pts.length > 100) return null;
  const coords = pts.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const radiuses = pts.map(() => String(SNAP_RADIUS_M)).join(';');
  const url =
    `${MATCH_BASE}/${coords}` +
    `?geometries=geojson&overview=full&gaps=ignore&radiuses=${radiuses}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code !== 'Ok' || !json.matchings || json.matchings.length !== 1) return null;
    const line: number[][] | undefined = json.matchings[0].geometry?.coordinates;
    if (!line || line.length < 2) return null;
    const snapped = line.map(([lng, lat]) => [lat, lng] as LatLng);
    const ratio = pathLength(snapped) / Math.max(1, pathLength(pts));
    if (!(ratio > 0.85 && ratio < 1.25)) return null;
    return snapped;
  } catch {
    return null;
  }
}

const STORAGE_KEY = 'shuttle-custom-routes-v2';

// Permanent hand-drawn routes go here, as [lat, lng] points, e.g.
// R03: [[13.96558, 100.58541], [13.96505, 100.58615], ...]
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

function AutoFitView({ stops }: { stops: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (stops && stops.length > 0) {
      const bounds = stops.map((s) => [s.lat, s.lng] as LatLng);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [stops, map]);
  return null;
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

/**
 * Routes ONE leg (stop A to stop B). Returns null if routing fails.
 */
async function fetchLegPath(a: LatLng, b: LatLng): Promise<LatLng[] | null> {
  const coords = `${a[1]},${a[0]};${b[1]},${b[0]}`;
  const radiuses = `${SNAP_RADIUS_METERS};${SNAP_RADIUS_METERS}`;
  const url =
    `${OSRM_BASE}/${coords}` +
    `?overview=full&geometries=geojson&radiuses=${radiuses}&continue_straight=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code !== 'Ok') return null;
    const line: number[][] | undefined = json.routes?.[0]?.geometry?.coordinates;
    if (!line || line.length < 2) return null;
    return line.map(([lng, lat]) => [lat, lng] as LatLng);
  } catch (err) {
    console.warn('OSRM leg failed:', err);
    return null;
  }
}

/**
 * Routes each leg separately and joins them. A leg that fails becomes a
 * straight line, so one bad leg no longer turns the whole route into straight lines.
 * Returns null only if every leg failed.
 */
async function fetchOsrmPath(stopCoords: LatLng[]): Promise<LatLng[] | null> {
  const full: LatLng[] = [];
  let okLegs = 0;

  for (let i = 0; i < stopCoords.length - 1; i++) {
    const a = stopCoords[i];
    const b = stopCoords[i + 1];
    const leg = await fetchLegPath(a, b);
    if (leg) okLegs++;
    const piece = leg ?? [a, b];
    full.push(...(full.length ? piece.slice(1) : piece));
  }

  return okLegs > 0 ? full : null;
}

export default function AdminFleetMap({ stops = [], routes = [] }: AdminFleetMapProps) {
  const [vehicles, setVehicles] = useState<Record<string, VehicleLocationPayload>>({});
  const [connected, setConnected] = useState(false);
  const [LInstance, setLInstance] = useState<typeof import('leaflet') | null>(null);
  const [routePaths, setRoutePaths] = useState<Record<string, RoutePath>>({});
  const [activeRouteFilter, setActiveRouteFilter] = useState<string>('ALL');
  const [customPaths, setCustomPaths] = useState<Record<string, LatLng[]>>(ROUTE_GEOMETRY);
  const [drawRouteId, setDrawRouteId] = useState<string | null>(null);
  const [draftPoints, setDraftPoints] = useState<LatLng[]>([]);
  const [copied, setCopied] = useState(false);

  // Road-snapped versions of the drawn lines, keyed by a fingerprint of the drawn points
  const [snapped, setSnapped] = useState<Record<string, LatLng[]>>({});
  const snapTried = useRef<Set<string>>(new Set());

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
        if (pts.length < 2) continue;
        const fp = `${id}:${hashPoints(pts)}`;
        let result: LatLng[] | null = cache[fp] ?? null;
        if (!result && !snapTried.current.has(fp)) {
          snapTried.current.add(fp);
          result = await snapToRoads(pts);
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
  }, [customPaths]);

  // Lines used for display: road-snapped if available, otherwise cleaned-up drawn points
  const displayPaths = useMemo(() => {
    const out: Record<string, LatLng[]> = {};
    Object.entries(customPaths).forEach(([id, pts]) => {
      const onRoad = snapped[`${id}:${hashPoints(pts)}`];
      // Road-snapped lines get an extra straightening pass to remove small kinks
      out[id] = onRoad ? smooth(simplify(onRoad, SIMPLIFY_METERS * 2), 1) : tidyPath(pts);
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

  const startDraw = (id: string) => {
    setDrawRouteId(id);
    setDraftPoints([]);
    setCopied(false);
  };

  const cancelDraw = () => {
    setDrawRouteId(null);
    setDraftPoints([]);
  };

  const saveDraw = () => {
    if (drawRouteId && draftPoints.length > 1) {
      persistCustom({ ...customPaths, [drawRouteId]: draftPoints });
    }
    cancelDraw();
  };

  const removeSaved = (id: string) => {
    const next = { ...customPaths };
    delete next[id];
    persistCustom(next);
  };

  const copyJson = async () => {
    const id = drawRouteId ?? activeRouteFilter;
    const pts = drawRouteId ? draftPoints : customPaths[id] || [];
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
        const lat = Number(s.lat ?? s.latitude);
        const lng = Number(s.lng ?? s.longitude);
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

  // Coordinate lookup map
  const stopCoordinatesMap = useMemo(() => {
    const map = new Map<string, LatLng>();
    validStops.forEach((s) => {
      if (s.id) map.set(String(s.id), [s.lat, s.lng]);
    });
    return map;
  }, [validStops]);

  // Build each route's path: stored geometry first, then OSRM, then straight lines
  useEffect(() => {
    if (!routes || routes.length === 0 || stopCoordinatesMap.size === 0) return;

    let cancelled = false;

    const buildRoute = async (route: any) => {
      const routeId: string | undefined = route?.id;
      if (!routeId) return;

      // Hand-drawn routes need no routing request
      if (ROUTE_GEOMETRY[routeId]) return;

      // 1) Geometry already stored on the route: use it exactly as is
      const stored = parseStoredGeometry(route);
      if (stored) {
        if (!cancelled) {
          setRoutePaths((prev) => ({ ...prev, [routeId]: { positions: stored, source: 'stored' } }));
        }
        return;
      }

      // 2) Otherwise build from the ordered stops
      try {
        const res = await fetch(`${API_BASE}/api/routes/${routeId}/stops`);
        if (!res.ok) {
          console.warn(`Stops request for ${routeId} failed with`, res.status);
          return;
        }

        const data = await res.json();
        const rawList: any[] = Array.isArray(data) ? data : data.data || data.stops || [];

        const sortedStops = [...rawList].sort(
          (a, b) =>
            Number(a.stopOrder ?? a.sequence ?? a.order ?? 0) -
            Number(b.stopOrder ?? b.sequence ?? b.order ?? 0)
        );

        const stopCoords: LatLng[] = [];
        sortedStops.forEach((item) => {
          // Try every plausible ID field and keep the first one that matches a master stop.
          // item.id is last because it is often the join-row ID, not the stop ID.
          const candidates = [item.stopId, item.stop?.id, item.stop_id, item.id];
          for (const c of candidates) {
            if (c == null) continue;
            const coord = stopCoordinatesMap.get(String(c));
            if (coord) {
              stopCoords.push(coord);
              return;
            }
          }
          console.warn(`Route ${routeId}: could not match stop`, item);
        });

        if (stopCoords.length < 2) return;

        const cacheKey = stopCoords.map(([a, b]) => `${a},${b}`).join('|');
        let snapped: LatLng[] | null;
        if (osrmCache.current.has(cacheKey)) {
          snapped = osrmCache.current.get(cacheKey) ?? null;
        } else {
          snapped = await fetchOsrmPath(stopCoords);
          osrmCache.current.set(cacheKey, snapped);
        }

        if (cancelled) return;

        setRoutePaths((prev) => ({
          ...prev,
          [routeId]: snapped
            ? { positions: snapped, source: 'osrm' }
            : { positions: stopCoords, source: 'straight' },
        }));
      } catch (err) {
        console.error(`Failed to build path for route ${routeId}:`, err);
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
  }, [routes, stopCoordinatesMap]);

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
    return LInstance.divIcon({
      className: 'custom-stop-icon',
      html: `
        <div title="${name}" style="
          font-size: 26px;
          cursor: pointer;
          pointer-events: auto;
          line-height: 28px;
          text-align: center;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
        ">📍</div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 8],
    });
  };

  const defaultCenter: LatLng =
    validStops.length > 0 ? [validStops[0].lat, validStops[0].lng] : [13.9648691, 100.5881689];

  // Filter routes based on selected toggle
  const visibleRoutes = routes.filter((r) =>
    activeRouteFilter === 'ALL' ? true : r.id === activeRouteFilter
  );

  return (
    <div className="w-full h-[520px] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl">
      {/* Top Floating Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-[1000] pointer-events-none">
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
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validStops.length > 0 && <AutoFitView stops={validStops} />}

            {/* Rendered Route Polylines */}
            {visibleRoutes.map((r) => {
              if (drawRouteId === r.id) return null;
              const path: RoutePath | undefined = customPaths[r.id]
                ? { positions: displayPaths[r.id] ?? customPaths[r.id], source: 'stored' }
                : routePaths[r.id];
              if (!path || path.positions.length < 2) return null;

              return (
                <Polyline
                  key={`${r.id}-${path.source}`}
                  positions={path.positions}
                  pathOptions={{
                    color: r.color || '#2563eb',
                    weight: Math.max(4, 9 - 2 * routes.findIndex((x) => x.id === r.id)),
                    opacity: 0.9,
                    lineJoin: 'round',
                    lineCap: 'round',
                    // Dashed line = routing failed, these are straight lines between stops
                    dashArray: path.source === 'straight' ? '8 10' : undefined,
                  }}
                />
              );
            })}

            {/* Route drawing */}
            {drawRouteId && (
              <DrawClickHandler onAdd={(pt) => setDraftPoints((prev) => [...prev, pt])} />
            )}
            {drawRouteId && draftPoints.length > 0 && (
              <>
                <Polyline
                  positions={draftPoints}
                  pathOptions={{
                    color: routes.find((r) => r.id === drawRouteId)?.color || '#2563eb',
                    weight: 5,
                    opacity: 0.9,
                  }}
                />
                {draftPoints.map((pt, i) => (
                  <CircleMarker
                    key={i}
                    center={pt}
                    radius={4}
                    pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#111827', fillOpacity: 1 }}
                  />
                ))}
              </>
            )}

            {/* Stop Pins */}
            {validStops.map((s) => {
              const icon = getStopIcon(s.name);
              if (!icon) return null;

              return (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lng]}
                  icon={icon}
                  interactive={!drawRouteId}
                >
                  <Popup offset={[0, -22]}>
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

      {/* Route drawing tool */}
      <div className="absolute bottom-14 right-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg text-xs flex items-center gap-2 shadow-md pointer-events-auto">
        {drawRouteId ? (
          <>
            <span className="text-slate-200 font-medium">
              Drawing {drawRouteId}: {draftPoints.length} points. Click along the road.
            </span>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={() => setDraftPoints((prev) => prev.slice(0, -1))}>Undo</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={() => setDraftPoints([])}>Clear</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={copyJson}>{copied ? 'Copied' : 'Copy JSON'}</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700" onClick={cancelDraw}>Cancel</button>
            <button
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-600 text-white disabled:opacity-40"
              disabled={draftPoints.length < 2}
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
