export interface Vehicle {
  id: string;
  sourceId?: string;
  plateNumber: string;
  model: string;
  status: 'ACTIVE' | 'INACTIVE' | 'in_progress';
  routeId: string | null;
  routeName?: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Stop {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
}

export interface RouteStop {
  id: string;
  routeStopId?: string;
  stopId: string;
  name: string;
  code: string;
  stopOrder: number;
  sequenceOrder?: number;
  latitude?: number;
  longitude?: number;
}

export interface ReorderStopPayload {
  stopId: string;
  stopOrder: number;
}

export interface RouteGeometry {
  type: string;
  coordinates: [number, number][];
}

export interface LiveTripVehicle {
  tripId?: string;
  vehicleId: string;
  sourceId?: string;
  plateNumber?: string;
  routeId?: string;
  routeName?: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  status?: string;
  updatedAt?: string;
}

export interface VehicleLocationPayload {
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  updatedAt: string;
}