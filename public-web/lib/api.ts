import type { Route, Stop } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status}).`);
  }
  return response.json();
}

/*
 * These endpoints are intentionally isolated here.
 * If the backend team changes the final API contract, update this file
 * instead of changing the UI components.
 */
export async function getRoutes(): Promise<Route[]> {
  const data = await request<unknown>("/api/routes");
  return Array.isArray(data) ? data : (data as { data?: Route[] }).data ?? [];
}

export async function getStops(routeId: string): Promise<Stop[]> {
  const data = await request<unknown>(`/api/routes/${encodeURIComponent(routeId)}/stops`);
  const stops = Array.isArray(data) ? data : (data as { data?: Stop[] }).data ?? [];
  return [...stops].sort(
    (a, b) => (a.stopOrder ?? a.sequence ?? 0) - (b.stopOrder ?? b.sequence ?? 0)
  );
}
