import type { Route, Stop } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status}).`);
  }
  return response.json();
}

function normalizeRoute(route: any): Route {
  return {
    id: String(route.id),
    routeCode: String(route.id),
    name: route.name ?? route.id,
    active: route.status !== "inactive",
  };
}

function normalizeStop(routeStop: any): Stop {
  const stop = routeStop?.stop ?? routeStop ?? {};
  const latitude = Number(stop.lat ?? stop.latitude ?? 0);
  const longitude = Number(stop.lng ?? stop.longitude ?? 0);

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

  return [...routeStops]
    .map(normalizeStop)
    .sort((a, b) => (a.stopOrder ?? a.sequence ?? 0) - (b.stopOrder ?? b.sequence ?? 0));
}
