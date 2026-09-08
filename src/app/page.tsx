'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { transportApi } from '@/services/apiClient';
import { Vehicle, Route, Stop } from '@/types/transport';
import { VehicleRouteAssigner } from '@/components/VehicleRouteAssigner';
import { RealtimeFleetOverview } from '@/components/RealtimeFleetOverview';

const DEMO_VEHICLES: Vehicle[] = [
  { id: 'v-1', plateNumber: '8821', model: 'Toyota Commuter Van', status: 'ACTIVE', routeId: 'r-1', routeName: 'Route 101 Express' },
  { id: 'v-2', plateNumber: '4309', model: 'Mercedes Sprinter Mini-Bus', status: 'ACTIVE', routeId: 'r-2', routeName: 'Campus Loop' },
  { id: 'v-3', plateNumber: '1104', model: 'Isuzu Elf Transit', status: 'INACTIVE', routeId: null },
];

const DEMO_ROUTES: Route[] = [
  { id: 'r-1', name: 'Route 101 Express', code: 'RT-101', status: 'ACTIVE' },
  { id: 'r-2', name: 'Campus Loop', code: 'RT-202', status: 'ACTIVE' },
  { id: 'r-3', name: 'Airport Direct', code: 'RT-303', status: 'INACTIVE' },
];

const DEMO_STOPS: Stop[] = [
  { id: 's-1', name: 'Central Station Terminal', code: 'CST-01', latitude: 13.7563, longitude: 100.5018 },
  { id: 's-2', name: 'University Main Gate', code: 'UMG-02', latitude: 13.7650, longitude: 100.5100 },
  { id: 's-3', name: 'Tech Park Business Center', code: 'TPB-03', latitude: 13.7720, longitude: 100.5250 },
  { id: 's-4', name: 'North Market Plaza', code: 'NMP-04', latitude: 13.7800, longitude: 100.5350 },
];

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<'realtime' | 'vehicles' | 'routes' | 'stops'>('realtime');

  const { data: vData } = useQuery({ queryKey: ['vehicles'], queryFn: transportApi.getVehicles, retry: false });
  const { data: rData } = useQuery({ queryKey: ['routes'], queryFn: transportApi.getRoutes, retry: false });
  const { data: sData } = useQuery({ queryKey: ['stops'], queryFn: transportApi.getStops, retry: false });

  const routes = rData && rData.length > 0 ? rData : DEMO_ROUTES;
  const stops = sData && sData.length > 0 ? sData : DEMO_STOPS;
  const displayVehicles = vData && vData.length > 0 ? vData : vehicles;

  const handleAssignRoute = (vehicleId: string, routeId: string | null, routeName?: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? { ...v, routeId, routeName: routeName || (routeId ? v.routeName : undefined) }
          : v
      )
    );
  };

  return (
    <main className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Operations Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Fleet monitoring, transit route control, and master stop directories.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 gap-6">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`pb-3 text-sm font-medium transition cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'realtime' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Realtime Dashboard
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-3 text-sm font-medium transition cursor-pointer border-b-2 ${
              activeTab === 'vehicles' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Vehicles ({displayVehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`pb-3 text-sm font-medium transition cursor-pointer border-b-2 ${
              activeTab === 'routes' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Routes ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('stops')}
            className={`pb-3 text-sm font-medium transition cursor-pointer border-b-2 ${
              activeTab === 'stops' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Stops ({stops.length})
          </button>
        </div>

        {/* Tab 1: Realtime Live Operations */}
        {activeTab === 'realtime' && <RealtimeFleetOverview />}

        {/* Tab 2: Vehicles Registry */}
        {activeTab === 'vehicles' && (
          <div className="space-y-3">
            {displayVehicles.map((v) => (
              <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white tracking-wide">{v.plateNumber}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      v.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{v.model}</p>
                  <p className="text-xs text-slate-400">
                    Route: <span className={v.routeName || v.routeId ? 'text-blue-400 font-medium' : 'text-slate-500 italic'}>{v.routeName || v.routeId || 'Unassigned'}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(v)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-500 transition self-start sm:self-auto cursor-pointer"
                >
                  Assign Route
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Routes Directory */}
        {activeTab === 'routes' && (
          <div className="space-y-3">
            {routes.map((r) => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{r.name}</p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">{r.code}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Status: <span className="text-slate-300 font-medium">{r.status}</span></p>
                </div>
                <Link
                  href={`/routes/${r.id}`}
                  className="px-3.5 py-1.5 text-xs font-semibold text-blue-400 border border-blue-900/60 rounded bg-blue-950/40 hover:bg-blue-900/60 hover:text-white transition self-start sm:self-auto cursor-pointer"
                >
                  Manage Stops & Sequence &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Master Stops Catalog */}
        {activeTab === 'stops' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3 font-semibold">Stop Name</th>
                  <th className="p-3 font-semibold">Code</th>
                  <th className="p-3 font-semibold">Coordinates (Lat, Lng)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {stops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-700/40 transition">
                    <td className="p-3 font-medium text-white">{s.name}</td>
                    <td className="p-3 font-mono text-slate-300">{s.code}</td>
                    <td className="p-3 font-mono text-slate-400">{s.latitude}, {s.longitude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Assign Route Modal */}
        {selectedVehicle && (
          <VehicleRouteAssigner
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
            onAssign={handleAssignRoute}
          />
        )}
      </div>
    </main>
  );
}