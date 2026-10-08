'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMap } from 'react-leaflet';
import { getSocket } from '@/services/socket';
import { VehicleLocationPayload } from '@/types/transport';
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

// Auto-pan helper to focus on database stops automatically
function AutoFitView({ stops }: { stops: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (stops && stops.length > 0) {
      const bounds = stops.map((s) => [s.lat, s.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [stops, map]);
  return null;
}

interface AdminFleetMapProps {
  stops?: any[];
  routes?: any[];
}

export default function AdminFleetMap({ stops = [], routes = [] }: AdminFleetMapProps) {
  const [vehicles, setVehicles] = useState<Record<string, VehicleLocationPayload>>({});
  const [connected, setConnected] = useState(false);
  const [LInstance, setLInstance] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((mod) => {
      setLInstance(mod.default || mod);
    });

    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onLocation = (data: VehicleLocationPayload) => {
      if (data && data.vehicleId) {
        setVehicles((prev) => ({ ...prev, [data.vehicleId]: data }));
      }
    };

    if (socket.connected) setConnected(true);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('vehicle:location', onLocation);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('vehicle:location', onLocation);
    };
  }, []);

  const validVehicles = Object.values(vehicles).filter(
    (v) => v && !isNaN(Number(v.lat)) && !isNaN(Number(v.lng))
  );

  // Normalize stops from real database schema (supports nameEn, nameTh, lat, lng)
  const validStops = (stops || [])
    .map((s: any, idx: number) => {
      const lat = parseFloat(String(s.lat ?? s.latitude));
      const lng = parseFloat(String(s.lng ?? s.longitude));
      const name = s.nameEn || s.nameTh || s.name || `Stop ${idx + 1}`;

      return {
        id: s.id || `stop-${idx}`,
        name,
        lat,
        lng,
      };
    })
    .filter((s) => !isNaN(s.lat) && !isNaN(s.lng) && s.lat !== 0 && s.lng !== 0);

  // Normalize routes from real database
  const validRoutes = (routes || [])
    .map((r: any, idx: number) => {
      let positions: [number, number][] = [];

      if (Array.isArray(r.path) && r.path.length > 0) {
        positions = r.path;
      } else if (Array.isArray(r.routeStops) && r.routeStops.length > 0) {
        positions = r.routeStops
          .map((rs: any) => {
            const stop = rs.stop || rs;
            const lat = parseFloat(String(stop.lat ?? stop.latitude));
            const lng = parseFloat(String(stop.lng ?? stop.longitude));
            return [lat, lng] as [number, number];
          })
          .filter((coord: [number, number]) => !isNaN(coord[0]) && !isNaN(coord[1]));
      }

      return {
        id: r.id || `route-${idx}`,
        name: r.name || `Route ${idx + 1}`,
        color: r.color || '#3b82f6',
        positions,
      };
    })
    .filter((r) => r.positions.length > 1);

  // Vehicle marker icon
  const getVehicleIcon = (v: VehicleLocationPayload) => {
    if (!LInstance) return undefined;
    return LInstance.divIcon({
      className: 'custom-vehicle-icon',
      html: `
        <div style="
          background-color: #2563eb;
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          white-space: nowrap;
          cursor: pointer;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div>🚍 ${v.vehicleId}</div>
          <div style="font-size: 9px; opacity: 0.9;">${v.speed ?? 0} km/h</div>
        </div>
      `,
      iconSize: [60, 36],
      iconAnchor: [30, 18],
    });
  };

  // Stop pin marker icon
  const getStopIcon = (name: string) => {
    if (!LInstance) return undefined;
    return LInstance.divIcon({
      className: 'custom-stop-icon',
      html: `
        <div title="${name}" style="
          font-size: 26px;
          cursor: pointer;
          pointer-events: auto;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
          transform: translate(-50%, -100%);
        ">📍</div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  };

  const defaultCenter: [number, number] =
    validStops.length > 0 ? [validStops[0].lat, validStops[0].lng] : [13.7563, 100.5018];

  return (
    <div className="w-full h-[520px] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl">
      {/* Top Floating Status Overlay */}
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

        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-300 pointer-events-auto shadow-md">
          Tracking: <strong className="text-white">{validVehicles.length}</strong> Vehicles
        </div>
      </div>

      {/* Leaflet Map Surface */}
      <div className="w-full h-full relative z-0">
        {LInstance ? (
          <MapContainer
            center={defaultCenter}
            zoom={14}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '520px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Automatically adjust bounds to show all real stops */}
            {validStops.length > 0 && <AutoFitView stops={validStops} />}

            {/* Real Route Polylines */}
            {validRoutes.map((r) => (
              <Polyline
                key={r.id}
                positions={r.positions}
                pathOptions={{ color: r.color, weight: 5, opacity: 0.7 }}
              />
            ))}

            {/* Real Stop Pins with Popups */}
            {validStops.map((s) => {
              const icon = getStopIcon(s.name);
              if (!icon) return null;

              return (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lng]}
                  icon={icon}
                  interactive={true}
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

            {/* Live Vehicle Markers */}
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