export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  status: 'ACTIVE' | 'INACTIVE';
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
  routeStopId: string;
  stopId: string;
  name: string;
  code: string;
  sequenceOrder: number;
}

export type VehicleOperationalStatus = 'IN_SERVICE' | 'IDLE' | 'DELAYED' | 'OUT_OF_SERVICE';

export interface RealtimeVehicleStatus {
  vehicleId: string;
  plateNumber: string;
  model: string;
  routeName: string;
  currentStopName: string;
  nextStopName: string;
  status: VehicleOperationalStatus;
  speedKmh: number;
  lastUpdated: string;
}