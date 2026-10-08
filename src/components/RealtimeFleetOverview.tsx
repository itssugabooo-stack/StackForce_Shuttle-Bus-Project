'use client';

import React, { useEffect, useState } from 'react';
import { getSocket } from '@/services/socket';
import { transportApi } from '@/services/apiClient';
import { LiveTripVehicle, VehicleLocationPayload } from '@/types/transport';

export function RealtimeFleetOverview() {
  const [vehicles, setVehicles] = useState<Record<string, LiveTripVehicle>>({});

  useEffect(() => {
    // 1. Initial live trips fetch from backend
    transportApi.getLiveTrips()
      .then((trips) => {
        const initialMap: Record<string, LiveTripVehicle> = {};
        trips.forEach((t) => {
          initialMap[t.vehicleId] = t;
        });
        setVehicles(initialMap);
      })
      .catch((err) => console.warn('Could not fetch active trips:', err));

    // 2. Socket.IO live updates
    const socket = getSocket();
    const handleLocationUpdate = (data: VehicleLocationPayload) => {
      setVehicles((prev) => ({
        ...prev,
        [data.vehicleId]: {
          ...(prev[data.vehicleId] || {}),
          vehicleId: data.vehicleId,
          lat: data.lat,
          lng: data.lng,
          speed: data.speed,
          heading: data.heading,
          updatedAt: data.updatedAt,
          status: 'in_progress',
        },
      }));
    };

    socket.on('vehicle:location', handleLocationUpdate);

    return () => {
      socket.off('vehicle:location', handleLocationUpdate);
    };
  }, []);

  const activeList = Object.values(vehicles);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white">Active Transit Fleet Status</h2>
          <p className="text-xs text-slate-400">Current live trips broadcasted via Socket.IO engine</p>
        </div>
        <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded font-medium">
          {activeList.length} Active Unit{activeList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {activeList.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400">No vehicles are currently sending telemetry.</p>
          <p className="text-[11px] text-slate-500 mt-1">Start a trip via device client or trigger test-socket.html.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeList.map((v) => (
            <div key={v.vehicleId} className="p-3 bg-slate-900 border border-slate-700 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-white">
                  🚍 {v.plateNumber || `Vehicle ${v.vehicleId}`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                  {v.status || 'Active'}
                </span>
              </div>
              <div className="text-xs text-slate-400 pt-1">
                <div>Coords: {v.lat.toFixed(4)}, {v.lng.toFixed(4)}</div>
                <div>Speed: {v.speed ?? 0} km/h • Heading: {v.heading ?? 0}°</div>
              </div>
              {v.updatedAt && (
                <div className="text-[10px] text-slate-500 pt-1">
                  Updated: {new Date(v.updatedAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RealtimeFleetOverview;