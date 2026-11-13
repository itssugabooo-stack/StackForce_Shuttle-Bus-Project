'use client';

import React, { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import { transportApi } from '@/services/apiClient';
import type { LiveTripVehicle, VehicleLocationPayload } from '@/types/transport';

export function RealtimeFleetOverview() {
  const [vehicles, setVehicles] = useState<Record<string, LiveTripVehicle>>({});

  useEffect(() => {
    let isCurrent = true;
    let socket: Socket | null = null;

    // 1. Initial live trips fetch from backend
    transportApi.getLiveTrips()
      .then((trips) => {
        if (!isCurrent) return;
        const initialMap: Record<string, LiveTripVehicle> = {};
        trips.forEach((t) => {
          initialMap[t.vehicleId] = t;
        });
        setVehicles(initialMap);
      })
      .catch((err) => console.warn('Could not fetch active trips:', err));

    // 2. Socket.IO live updates
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

    void getSocket()
      .then((authenticatedSocket) => {
        if (!isCurrent) return;
        socket = authenticatedSocket;
        socket.on('vehicle:location', handleLocationUpdate);
        socket.connect();
      })
      .catch((err: unknown) => {
        if (isCurrent) console.warn('Could not initialize realtime socket:', err);
      });

    return () => {
      isCurrent = false;
      socket?.off('vehicle:location', handleLocationUpdate);
    };
  }, []);

  const activeList = Object.values(vehicles);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#0b1220]">Active trips</h2>
          <p className="text-sm text-slate-500">Position, speed and last update of each shuttle on a trip</p>
        </div>
        <span className="tabular shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          {activeList.length} active
        </span>
      </div>

      {activeList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center">
          <p className="text-sm font-medium text-slate-600">No shuttles are sending their position right now.</p>
          <p className="mt-1 text-xs text-slate-400">They appear here as soon as a tracker starts sending.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeList.map((v) => {
            const hasPosition = v.lat != null && v.lng != null && Number.isFinite(Number(v.lat)) && Number.isFinite(Number(v.lng));
            const updated = v.updatedAt ? new Date(v.updatedAt) : null;
            return (
              <div key={v.vehicleId} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#0b1220]">{v.plateNumber || v.vehicleId}</span>
                  {hasPosition ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Waiting for GPS</span>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Speed</dt>
                    <dd className="tabular font-semibold text-slate-800">{Math.round(Number(v.speed) || 0)} km/h</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Heading</dt>
                    <dd className="tabular font-semibold text-slate-800">{Math.round(Number(v.heading) || 0)}°</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-slate-500">Position</dt>
                    <dd className="tabular font-mono text-xs text-slate-700">
                      {hasPosition ? `${Number(v.lat).toFixed(5)}, ${Number(v.lng).toFixed(5)}` : '–'}
                    </dd>
                  </div>
                </dl>
                {updated && !Number.isNaN(updated.getTime()) && (
                  <div className="border-t border-slate-200 pt-2 text-xs text-slate-400">
                    Updated {updated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RealtimeFleetOverview;