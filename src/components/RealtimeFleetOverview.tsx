'use client';

import React, { useState, useEffect } from 'react';
import { RealtimeVehicleStatus } from '@/types/transport';

const INITIAL_FLEET_DATA: RealtimeVehicleStatus[] = [
  {
    vehicleId: 'v-1',
    plateNumber: '1กก-8821',
    model: 'Toyota Commuter Van',
    routeName: 'Route 101 Express',
    currentStopName: 'Central Station Terminal',
    nextStopName: 'University Main Gate',
    status: 'IN_SERVICE',
    speedKmh: 42,
    lastUpdated: 'Just now',
  },
  {
    vehicleId: 'v-2',
    plateNumber: '2ขข-4309',
    model: 'Mercedes Sprinter Mini-Bus',
    routeName: 'Campus Loop',
    currentStopName: 'Tech Park Business Center',
    nextStopName: 'North Market Plaza',
    status: 'DELAYED',
    speedKmh: 18,
    lastUpdated: '1 min ago',
  },
  {
    vehicleId: 'v-3',
    plateNumber: '3คค-1104',
    model: 'Isuzu Elf Transit',
    routeName: 'Unassigned',
    currentStopName: 'Depot Yard',
    nextStopName: 'None',
    status: 'IDLE',
    speedKmh: 0,
    lastUpdated: '4 mins ago',
  },
];

export function RealtimeFleetOverview() {
  const [fleet] = useState<RealtimeVehicleStatus[]>(INITIAL_FLEET_DATA);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>('Connected');

  useEffect(() => {
    const timer = setInterval(() => {
      setLastHeartbeat(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const inServiceCount = fleet.filter((v) => v.status === 'IN_SERVICE').length;
  const delayedCount = fleet.filter((v) => v.status === 'DELAYED').length;
  const idleCount = fleet.filter((v) => v.status === 'IDLE').length;

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
          <p className="text-xs text-slate-400 font-medium uppercase">Active Fleet</p>
          <p className="text-2xl font-bold text-white mt-1">{fleet.length}</p>
          <span className="text-[11px] text-slate-400">Tracked Units</span>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
          <p className="text-xs text-emerald-400 font-medium uppercase">In Service</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{inServiceCount}</p>
          <span className="text-[11px] text-slate-400">On Active Routes</span>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
          <p className="text-xs text-amber-400 font-medium uppercase">Delayed</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{delayedCount}</p>
          <span className="text-[11px] text-slate-400">Traffic Congestion</span>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
          <p className="text-xs text-slate-400 font-medium uppercase">Idle / Depot</p>
          <p className="text-2xl font-bold text-slate-300 mt-1">{idleCount}</p>
          <span className="text-[11px] text-slate-400">Available Units</span>
        </div>
      </div>

      {/* Realtime Telemetry Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white">Live Operations Feed</h3>
            <p className="text-xs text-slate-400">Real-time status broadcasted across fleet</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-slate-400">{lastHeartbeat}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-3.5 font-semibold">Vehicle</th>
                <th className="p-3.5 font-semibold">Assigned Route</th>
                <th className="p-3.5 font-semibold">Current / Next Stop</th>
                <th className="p-3.5 font-semibold">Speed</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Ping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {fleet.map((item) => (
                <tr key={item.vehicleId} className="hover:bg-slate-700/30 transition">
                  <td className="p-3.5">
                    <p className="font-semibold text-white tracking-wide">{item.plateNumber}</p>
                    <p className="text-[11px] text-slate-400">{item.model}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="font-medium text-slate-200">{item.routeName}</span>
                  </td>
                  <td className="p-3.5">
                    <p className="text-slate-200 font-medium">{item.currentStopName}</p>
                    <p className="text-[11px] text-slate-400">&rarr; {item.nextStopName}</p>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {item.speedKmh} km/h
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                      item.status === 'IN_SERVICE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      item.status === 'DELAYED' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      'bg-slate-700/60 text-slate-300 border-slate-600'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                    {item.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}