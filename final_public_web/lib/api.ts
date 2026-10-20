import type { Route, Stop, Vehicle } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5003";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status}).`);
  }
  return response.json();
}

function normalizeRoute(route: any): Route {
  const routeCode = route.routeCode ?? route.code ?? String(route.id ?? "");

  return {
    id: String(route.id),
    routeCode,
    name: route.name ?? route.routeName ?? route.id,
    active: route.status !== "inactive",
    color: typeof route.color === "string" ? route.color : "#4f46e5",
  };
}

function normalizeStop(routeStop: any): Stop {
  const stop = routeStop?.stop ?? routeStop ?? {};
  const latitude = Number(routeStop?.lat ?? routeStop?.latitude ?? stop.lat ?? stop.latitude ?? 0);
  const longitude = Number(routeStop?.lng ?? routeStop?.longitude ?? stop.lng ?? stop.longitude ?? 0);

  return {
    id: String(stop.id ?? routeStop?.stopId ?? ""),
    name: stop.nameEn ?? stop.nameTh ?? stop.name ?? `Stop ${routeStop?.stopOrder ?? 1}`,
    nameTh: stop.nameTh ?? null,
    nameEn: stop.nameEn ?? null,
    latitude: Number.isFinite(latitude) ? latitude : 0,
    longitude: Number.isFinite(longitude) ? longitude : 0,
    sequence: routeStop?.stopOrder ?? stop.sequence ?? null,
    stopOrder: routeStop?.stopOrder ?? stop.stopOrder ?? null,
  };
}

export async function getRoutes(): Promise<Route[]> {
  const data = await request<unknown>("/api/routes");
  const routes = Array.isArray(data) ? data : (data as { data?: any[] }).data ?? [];
  return routes.map(normalizeRoute);
}

export async function getStops(routeId: string): Promise<Stop[]> {
  const data = await request<unknown>(`/api/route-stops?routeId=${encodeURIComponent(routeId)}`);
  const routeStops = Array.isArray(data) ? data : (data as { data?: any[] }).data ?? [];

  const normalized = [...routeStops].map(normalizeStop).sort(
    (a, b) => (a.stopOrder ?? a.sequence ?? 0) - (b.stopOrder ?? b.sequence ?? 0)
  );

  const hasRealCoords = normalized.some(
    (stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude) && (stop.latitude !== 0 || stop.longitude !== 0)
  );

  if (hasRealCoords) {
    return normalized;
  }

  const allStopsData = await request<unknown>("/api/stops");
  const allStops = Array.isArray(allStopsData) ? allStopsData : (allStopsData as { data?: any[] }).data ?? [];
  const stopLookup = new Map(
    allStops.map((stop: any) => [String(stop.id ?? stop.stopId ?? ""), { latitude: Number(stop.lat ?? stop.latitude), longitude: Number(stop.lng ?? stop.longitude) }])
  );

  return normalized.map((stop) => {
    const lookup = stopLookup.get(String(stop.id));
    if (!lookup || !Number.isFinite(lookup.latitude) || !Number.isFinite(lookup.longitude)) {
      return stop;
    }

    return {
      ...stop,
      latitude: lookup.latitude,
      longitude: lookup.longitude,
    };
  });
}

export async function getRouteGeometry(routeId: string): Promise<[number, number][] | null> {
  try {
    const data = await request<unknown>(`/api/routes/${encodeURIComponent(routeId)}/geometry`);

    if (!data || typeof data !== "object") {
      return null;
    }

    const maybeGeoJson = data as {
      type?: string;
      geometry?: { coordinates?: [number, number][] };
      coordinates?: [number, number][];
    };

    const rawCoords = maybeGeoJson.geometry?.coordinates ?? maybeGeoJson.coordinates ?? null;
    if (!Array.isArray(rawCoords) || rawCoords.length === 0) {
      return null;
    }

    const normalized = rawCoords.map(([lng, lat]) => [Number(lat), Number(lng)] as [number, number]);
    return normalized.every(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)) ? normalized : null;
  } catch {
    return null;
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  const data = await request<unknown>("/api/vehicles");
  const vehicles = Array.isArray(data) ? data : (data as { data?: any[] }).data ?? [];

  return vehicles.map((vehicle) => ({
    id: String(vehicle.id),
    name: vehicle.name ?? "Vehicle",
    type: vehicle.type ?? "bus",
    routeId: vehicle.assignedRouteId ?? vehicle.routeId ?? null,
    status: vehicle.status ?? "inactive",
    latitude: typeof vehicle.latitude === "number" ? vehicle.latitude : null,
    longitude: typeof vehicle.longitude === "number" ? vehicle.longitude : null,
    heading: typeof vehicle.heading === "number" ? vehicle.heading : null,
    speed: typeof vehicle.speed === "number" ? vehicle.speed : null,
    updatedAt: vehicle.updatedAt ?? vehicle.createdAt ?? null,
  }));
}
