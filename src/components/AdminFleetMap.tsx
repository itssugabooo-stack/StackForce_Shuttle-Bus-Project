'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { initSocket, disconnectSocket } from '@/services/socket';

// Custom icons to avoid broken Leaflet marker assets in Next.js
const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const stopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

interface VehicleUpdate {
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  updatedAt: string;
}

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface RouteItem {
  id: string;
  name: string;
  path: [number, number][];
}

interface AdminFleetMapProps {
  stops?: Stop[];
  routes?: RouteItem[];
  authToken?: string;
}

export default function AdminFleetMap({ stops = [], routes = [], authToken }: AdminFleetMapProps) {
  const [vehicles, setVehicles] = useState<Record<string, VehicleUpdate>>({});

  useEffect(() => {
    const socket = initSocket(authToken);

    // Listen to vehicle:location emitted by the backend server
    socket.on('vehicle:location', (data: VehicleUpdate) => {
      setVehicles((prev) => ({
        ...prev,
        [data.vehicleId]: data,
      }));
    });

    return () => {
      socket.off('vehicle:location');
      disconnectSocket();
    };
  }, [authToken]);

  // Center around Rangsit University / Pathum Thani area
  const centerPosition: [number, number] = [13.9649, 100.5877];

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      <MapContainer
        center={centerPosition}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Draw route polylines */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.path}
            pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
          />
        ))}

        {/* 2. Display stops on the map */}
        {stops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup>
              <div className="font-semibold text-slate-900">{stop.name}</div>
              <div className="text-xs text-slate-500">Stop ID: {stop.id}</div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Display realtime vehicle markers */}
        {Object.values(vehicles).map((vehicle) => (
          <Marker
            key={vehicle.vehicleId}
            position={[vehicle.lat, vehicle.lng]}
            icon={vehicleIcon}
          >
            <Popup>
              <div className="font-bold text-slate-900">Vehicle: {vehicle.vehicleId}</div>
              <div className="text-xs text-slate-600">Speed: {vehicle.speed} km/h</div>
              <div className="text-xs text-slate-600">Heading: {vehicle.heading}°</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Updated: {new Date(vehicle.updatedAt).toLocaleTimeString()}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 4. Telemetry Overlay (Active Vehicles HUD) */}
      <div className="absolute top-4 right-4 z-[1000] w-64 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl text-white">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Vehicles
          </span>
          <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full font-semibold">
            {Object.keys(vehicles).length}
          </span>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Object.keys(vehicles).length === 0 ? (
            <p className="text-xs text-slate-400 py-1">Waiting for realtime GPS...</p>
          ) : (
            Object.values(vehicles).map((v) => (
              <div
                key={v.vehicleId}
                className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/60"
              >
                <div>
                  <p className="text-xs font-semibold text-blue-400">{v.vehicleId}</p>
                  <p className="text-[10px] text-slate-400">{v.speed} km/h</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Live Simulation Ping Button */}
      <button
        type="button"
        onClick={() => {
          setVehicles((prev) => ({
            ...prev,
            'v-1': {
              vehicleId: 'v-1 (Van 8821)',
              lat: 13.9645 + (Math.random() - 0.5) * 0.003,
              lng: 100.5875 + (Math.random() - 0.5) * 0.003,
              speed: Math.floor(Math.random() * 25) + 15,
              heading: Math.floor(Math.random() * 360),
              updatedAt: new Date().toISOString(),
            },
          }));
        }}
        className="absolute bottom-4 left-4 z-[1000] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xl border border-emerald-400 cursor-pointer transition flex items-center gap-1.5"
      >
        <span>🚗</span>
        <span>Simulate GPS Ping</span>
      </button>
    </div>
  );
}