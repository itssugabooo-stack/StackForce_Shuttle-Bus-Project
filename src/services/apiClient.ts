import { Vehicle, Route, Stop, RouteStop, ReorderStopPayload } from '@/types/transport';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API Error: ${res.status}`);
  }
  return res.json();
}

export const transportApi = {
  getVehicles: () => request<Vehicle[]>('/vehicles'),
  assignRouteToVehicle: (vehicleId: string, routeId: string | null) =>
    request<Vehicle>(`/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify({ routeId }),
    }),

  getRoutes: () => request<Route[]>('/routes'),
  getStops: () => request<Stop[]>('/stops'),
  getRouteStops: (routeId: string) => request<RouteStop[]>(`/routes/${routeId}/stops`),

  addStopToRoute: (routeId: string, stopId: string, sequenceOrder: number) =>
    request<RouteStop>(`/routes/${routeId}/stops`, {
      method: 'POST',
      body: JSON.stringify({ stopId, sequenceOrder }),
    }),

  removeStopFromRoute: (routeId: string, routeStopId: string) =>
    request<void>(`/routes/${routeId}/stops/${routeStopId}`, {
      method: 'DELETE',
    }),

  reorderRouteStops: (routeId: string, stops: ReorderStopPayload[]) =>
    request<RouteStop[]>(`/routes/${routeId}/stops/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ stops }),
    }),
};