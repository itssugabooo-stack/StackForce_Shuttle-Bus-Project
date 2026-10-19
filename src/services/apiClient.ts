import { Vehicle, Route, Stop, RouteStop, RouteStopOrderUpdate, RouteGeometry, LiveTripVehicle } from '@/types/transport';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_ORIGIN}/api${normalizedEndpoint}`, {
    ...options,
    headers,
    mode: 'cors',
  });
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
      method: 'PUT',
      body: JSON.stringify({ assignedRouteId: routeId }),
    }),

  getRoutes: () => request<Route[]>('/routes'),
  getStops: () => request<Stop[]>('/stops'),
  getRouteStops: (routeId: string) =>
    request<RouteStop[]>(`/route-stops?routeId=${encodeURIComponent(routeId)}`),
  addStopToRoute: (routeId: string, stopId: string, stopOrder: number) =>
    request<RouteStop>('/route-stops', {
      method: 'POST',
      body: JSON.stringify({ routeId, stopId, stopOrder }),
    }),
  removeStopFromRoute: (routeStopId: string) =>
    request<{ message: string }>(`/route-stops/${encodeURIComponent(routeStopId)}`, {
      method: 'DELETE',
    }),
  reorderRouteStops: async (updates: RouteStopOrderUpdate[]) => {
    const highestPreviousOrder = Math.max(0, ...updates.map((item) => item.previousStopOrder));
    const temporaryUpdates = updates.map((item, index) =>
      request<RouteStop>(`/route-stops/${encodeURIComponent(item.routeStopId)}`, {
        method: 'PUT',
        body: JSON.stringify({ stopOrder: highestPreviousOrder + index + 1 }),
      })
    );
    await Promise.all(temporaryUpdates);

    const finalUpdates = updates.map((item) =>
      request<RouteStop>(`/route-stops/${encodeURIComponent(item.routeStopId)}`, {
        method: 'PUT',
        body: JSON.stringify({ stopOrder: item.stopOrder }),
      })
    );
    await Promise.all(finalUpdates);
  },
  getRouteGeometry: (routeId: string) => request<RouteGeometry>(`/routes/${routeId}/geometry`),
  getLiveTrips: () => request<LiveTripVehicle[]>('/trips/live'),
};