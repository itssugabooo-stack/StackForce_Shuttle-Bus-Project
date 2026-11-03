export type LatLng = [number, number];

export const OSRM_BASE = 'https://routing.openstreetmap.de/routed-car/route/v1/driving';
// Bike roads include campus lanes that the car router avoids (but not footpaths)
const OSRM_BIKE_BASE = 'https://routing.openstreetmap.de/routed-bike/route/v1/driving';

const SNAP_RADIUS_M = 20; // how far (m) a drawn point may be from a real road
const MAX_SNAP_REQUESTS = 8; // off-road points each cost one retry on the public OSRM server
const MAX_SNAP_POINTS = 100;
const MAX_DETOUR_M = 15; // a routed leg longer than this beyond the drawn leg is a detour
const MAX_DETOUR_RATIO = 1.5;

// How far (m) a clicked waypoint may be from a road. OSRM always takes the nearest road
// inside this, so a wider radius quietly moves clicks onto a road nobody clicked on.
export const WAYPOINT_SNAP_RADIUS_M = 25;
const WAYPOINT_FAR_M = 12; // a click this far from its road is worth checking
// Waypoints can be far apart, so a road route may be much longer than the direct line
const SECTION_LONG_RATIO = 3;
const SECTION_LONG_EXTRA_M = 100;
const BEARING_TOLERANCE_DEG = 90;
const MAX_BEARING_RETRIES = 3;
const ROUTE_TIMEOUT_MS = 15000; // a server that never answers counts as unavailable

const SHARED_SAMPLE_M = 5;
const SHARED_DISTANCE_M = 6;
const SHARED_MIN_LENGTH_M = 25;
const SHARED_MIN_ALIGNMENT = 0.85; // |cos| of the angle between two routes running together

function toMeters(pts: LatLng[]): [number, number][] {
  const [lat0, lng0] = pts[0];
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110540;
  return pts.map(([lat, lng]) => [(lng - lng0) * kx, (lat - lat0) * ky]);
}

export function pathLength(pts: LatLng[]): number {
  if (pts.length < 2) return 0;
  const m = toMeters(pts);
  let total = 0;
  for (let i = 1; i < m.length; i++) total += Math.hypot(m[i][0] - m[i - 1][0], m[i][1] - m[i - 1][1]);
  return total;
}

function appendPoints(target: LatLng[], points: LatLng[]) {
  points.forEach((p) => {
    const last = target[target.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) target.push(p);
  });
}

type OsrmLeg = {
  distance: number;
  steps?: Array<{ geometry?: { coordinates?: number[][] } }>;
};

// Keeps each routed leg unless it wanders off on a detour (one-way loops, wrong road).
// A detour leg becomes a direct link, so one bad leg can't reject the whole route.
// `count.detours` counts those direct links, so callers can compare results.
function stitchLegs(legs: OsrmLeg[], run: LatLng[], count = { detours: 0 }): LatLng[] {
  const line: LatLng[] = [];
  legs.forEach((leg, i) => {
    const piece: LatLng[] = [];
    (leg.steps ?? []).forEach((step) => {
      appendPoints(piece, (step.geometry?.coordinates ?? []).map(([lng, lat]) => [lat, lng] as LatLng));
    });
    const drawn = pathLength([run[i], run[i + 1]]);
    const isDetour = leg.distance > Math.max(drawn * MAX_DETOUR_RATIO, drawn + MAX_DETOUR_M);
    if (isDetour && piece.length > 1) count.detours++;
    appendPoints(line, isDetour && piece.length > 1 ? [piece[0], piece[piece.length - 1]] : piece);
  });
  return line;
}

/**
 * Follows the real roads through the drawn points. Points OSRM can't place on a road
 * stay as drawn and the runs either side are routed separately.
 * Returns null when the server can't answer, so the caller can try again later.
 */
export async function snapToRoads(pts: LatLng[]): Promise<LatLng[] | null> {
  return (await snapWith(pts, OSRM_BASE))?.line ?? null;
}

/**
 * Snaps with car roads, and if any car leg had to be replaced by a straight link,
 * also with bike roads. Returns whichever result has fewer straight links.
 */
export async function snapToRoadsBest(pts: LatLng[]): Promise<LatLng[] | null> {
  const car = await snapWith(pts, OSRM_BASE);
  if (car && car.detours === 0) return car.line;
  const bike = await snapWith(pts, OSRM_BIKE_BASE);
  if (car && bike) {
    console.info(`Fallback line: car has ${car.detours} straight links, bike has ${bike.detours}`);
    return bike.detours < car.detours ? bike.line : car.line;
  }
  return (car ?? bike)?.line ?? null;
}

async function snapWith(
  pts: LatLng[],
  base: string
): Promise<{ line: LatLng[]; detours: number } | null> {
  if (pts.length < 2 || pts.length > MAX_SNAP_POINTS) return null;

  let requests = 0;
  const count = { detours: 0 };

  const snapRange = async (start: number, end: number): Promise<LatLng[]> => {
    const run = pts.slice(start, end + 1);
    if (run.length < 2) return run;
    if (++requests > MAX_SNAP_REQUESTS) return run;

    const coords = run.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const radiuses = run.map(() => String(SNAP_RADIUS_M)).join(';');
    const res = await fetch(
      `${base}/${coords}?overview=false&steps=true&geometries=geojson&radiuses=${radiuses}&continue_straight=false`
    );
    // Rate limits answer with an HTML page, and this throws on those too
    const json = await res.json();

    if (json.code === 'Ok') {
      const line = stitchLegs(json.routes?.[0]?.legs ?? [], run, count);
      return line.length > 1 ? line : run;
    }
    if (json.code !== 'NoSegment') throw new Error(`OSRM answered ${json.code}`);

    const badIndex = /coordinate (\d+)/.exec(json.message ?? '');
    if (!badIndex) return run;

    const bad = start + Number(badIndex[1]);
    const before = await snapRange(start, bad - 1);
    const after = await snapRange(bad + 1, end);
    return [...before, pts[bad], ...after];
  };

  try {
    const snapped: LatLng[] = [];
    appendPoints(snapped, await snapRange(0, pts.length - 1));
    return snapped.length > 1 ? { line: snapped, detours: count.detours } : null;
  } catch (err) {
    console.warn('OSRM route geometry request failed:', err);
    return null;
  }
}

export type LongSection = { section: number; directMeters: number; roadMeters: number };
export type FarWaypoint = { waypoint: number; meters: number };

export type RoadRoute =
  | { status: 'routed'; positions: LatLng[]; longSections: LongSection[]; farWaypoints: FarWaypoint[] }
  | { status: 'no-road'; waypoint: number }
  | { status: 'no-route' | 'unavailable' };

type OsrmRouteAnswer = {
  code?: string;
  message?: string;
  routes?: Array<{
    distance: number;
    geometry?: { coordinates?: number[][] };
    legs?: Array<{ distance: number }>;
  }>;
  waypoints?: Array<{ distance?: number }>;
};

async function askForRoute(pts: LatLng[], signal: AbortSignal, bearings?: Array<number | null>) {
  const coords = pts.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const radiuses = pts.map(() => String(WAYPOINT_SNAP_RADIUS_M)).join(';');
  const bearingParam = bearings
    ? `&bearings=${bearings.map((b) => (b === null ? '' : `${b},${BEARING_TOLERANCE_DEG}`)).join(';')}`
    : '';
  const res = await fetch(
    `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&radiuses=${radiuses}&continue_straight=false${bearingParam}`,
    { signal: AbortSignal.any([signal, AbortSignal.timeout(ROUTE_TIMEOUT_MS)]) }
  );
  // Rate limits answer with an HTML page, and this throws on those too
  return (await res.json()) as OsrmRouteAnswer;
}

function badCoordinate(answer: OsrmRouteAnswer): number | null {
  const match = /coordinate (\d+)/.exec(answer.message ?? '');
  return match ? Number(match[1]) : null;
}

function readRoute(answer: OsrmRouteAnswer, pts: LatLng[]) {
  const route = answer.routes?.[0];
  const line = route?.geometry?.coordinates;
  if (answer.code !== 'Ok' || !route || !line || line.length < 2) return null;

  const longSections: LongSection[] = [];
  (route.legs ?? []).forEach((leg, i) => {
    const directMeters = pathLength([pts[i], pts[i + 1]]);
    if (leg.distance > Math.max(directMeters * SECTION_LONG_RATIO, directMeters + SECTION_LONG_EXTRA_M)) {
      longSections.push({ section: i + 1, directMeters, roadMeters: leg.distance });
    }
  });
  const farWaypoints: FarWaypoint[] = [];
  (answer.waypoints ?? []).forEach((wp, i) => {
    if ((wp.distance ?? 0) > WAYPOINT_FAR_M) farWaypoints.push({ waypoint: i + 1, meters: wp.distance ?? 0 });
  });

  return {
    distance: route.distance,
    route: {
      status: 'routed' as const,
      positions: line.map(([lng, lat]) => [lat, lng] as LatLng),
      longSections,
      farWaypoints,
    },
  };
}

function bearingBetween(a: LatLng, b: LatLng): number {
  const [from, to] = toMeters([a, b]);
  return Math.round(((Math.atan2(to[0] - from[0], to[1] - from[1]) * 180) / Math.PI + 360) % 360);
}

// Direction of travel at each waypoint. It tells parallel roads and opposite one-ways
// apart, which the distance from the click alone can't do.
async function routeWithBearings(pts: LatLng[], signal: AbortSignal) {
  const bearings: Array<number | null> = pts.map((p, i) =>
    i === pts.length - 1 ? bearingBetween(pts[i - 1], p) : bearingBetween(p, pts[i + 1])
  );
  for (let attempt = 0; attempt <= MAX_BEARING_RETRIES; attempt++) {
    const answer = await askForRoute(pts, signal, bearings);
    if (answer.code !== 'NoSegment') return readRoute(answer, pts);
    // No road runs that way at this point, so let it go back to the nearest road
    const bad = badCoordinate(answer);
    if (bad === null || bearings[bad] === null) return null;
    bearings[bad] = null;
  }
  return null;
}

/**
 * Asks OSRM for one continuous road route through every waypoint, in order. Failures are
 * reported rather than replaced with straight lines or roads away from the clicks.
 */
export async function routeThroughWaypoints(pts: LatLng[], signal: AbortSignal): Promise<RoadRoute> {
  try {
    const answer = await askForRoute(pts, signal);
    if (answer.code === 'NoSegment') {
      const bad = badCoordinate(answer);
      return bad === null ? { status: 'no-route' } : { status: 'no-road', waypoint: bad };
    }
    if (answer.code === 'NoRoute') return { status: 'no-route' };

    const nearest = readRoute(answer, pts);
    if (!nearest) return { status: 'unavailable' };
    if (nearest.route.longSections.length === 0) return nearest.route;

    // A long section is often a click that landed on the wrong one of two nearby roads
    const directed = await routeWithBearings(pts, signal).catch(() => null);
    return directed && directed.distance < nearest.distance ? directed.route : nearest.route;
  } catch (err) {
    if (!signal.aborted) console.warn('OSRM road request failed:', err);
    return { status: 'unavailable' };
  }
}

function densify(pts: LatLng[], stepMeters: number): LatLng[] {
  const out: LatLng[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const steps = Math.max(1, Math.ceil(pathLength([pts[i], pts[i + 1]]) / stepMeters));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push([
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * Finds the stretches of `path` that run along `other` (either direction),
 * so both routes can stay visible where one would otherwise hide the other.
 */
export function findSharedStretches(path: LatLng[], other: LatLng[]): LatLng[][] {
  if (path.length < 2 || other.length < 2) return [];

  const samples = densify(path, SHARED_SAMPLE_M);
  const m = toMeters([...samples, ...other]);
  const sampleM = m.slice(0, samples.length);
  const otherM = m.slice(samples.length);

  const isShared = sampleM.map((p, i) => {
    const q = sampleM[Math.min(i + 1, sampleM.length - 1)];
    const r = sampleM[Math.max(i - 1, 0)];
    const dx = q[0] - r[0];
    const dy = q[1] - r[1];
    const dirLen = Math.hypot(dx, dy) || 1;

    for (let j = 0; j < otherM.length - 1; j++) {
      const a = otherM[j];
      const b = otherM[j + 1];
      const ex = b[0] - a[0];
      const ey = b[1] - a[1];
      const len2 = ex * ex + ey * ey;
      if (len2 === 0) continue;
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / len2));
      const distance = Math.hypot(p[0] - (a[0] + t * ex), p[1] - (a[1] + t * ey));
      const alignment = Math.abs(dx * ex + dy * ey) / (dirLen * Math.sqrt(len2));
      if (distance <= SHARED_DISTANCE_M && alignment >= SHARED_MIN_ALIGNMENT) return true;
    }
    return false;
  });

  const stretches: LatLng[][] = [];
  let current: LatLng[] = [];
  const flush = () => {
    if (pathLength(current) >= SHARED_MIN_LENGTH_M) stretches.push(current);
    current = [];
  };
  samples.forEach((p, i) => {
    if (isShared[i]) current.push(p);
    else flush();
  });
  flush();
  return stretches;
}