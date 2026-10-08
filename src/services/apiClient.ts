import { Vehicle, Route, Stop, RouteStop, RouteGeometry, LiveTripVehicle } from '@/types/transport';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
  
  // CHANGED FROM PATCH TO PUT TO MATCH vehicle.routes.ts:41
  assignRouteToVehicle: (vehicleId: string, routeId: string | null) =>
    request<Vehicle>(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify({ routeId }),
    }),

  getRoutes: () => request<Route[]>('/routes'),
  getStops: () => request<Stop[]>('/stops'),
  getRouteStops: (routeId: string) => request<RouteStop[]>(`/routes/${routeId}/stops`),
  getRouteGeometry: (routeId: string) => request<RouteGeometry>(`/routes/${routeId}/geometry`),
  getLiveTrips: () => request<LiveTripVehicle[]>('/trips/live'),
};