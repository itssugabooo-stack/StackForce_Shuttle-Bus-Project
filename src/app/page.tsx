'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import RealtimeFleetOverview from '@/components/RealtimeFleetOverview';
import { RouteStopManager } from '@/components/RouteStopManager';
import AdminRouteGuard from '@/components/AdminRouteGuard';
import { clearAdminToken } from '@/services/adminAuth';

interface DashboardVehicle {
  id: string;
  name?: string;
  plateNumber?: string;
  capacity?: number;
  status?: string;
  assignedRouteId?: string | null;
  routeId?: string | null;
  currentRouteId?: string | null;
}

interface DashboardStop {
  id: string;
  name?: string;
  nameEn?: string;
  nameTh?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

interface DashboardRouteStop extends DashboardStop {
  stopId?: string;
  stopOrder?: number;
  sequenceOrder?: number;
  stop?: DashboardStop;
}

interface DashboardRoute {
  id: string;
  name?: string;
  nameEn?: string;
  nameTh?: string;
  color?: string;
  status?: string;
  path?: [number, number][];
  routeStops?: DashboardRouteStop[];
  stops?: DashboardRouteStop[];
  route_stops?: DashboardRouteStop[];
  RouteStop?: DashboardRouteStop[];
  stopCount?: number;
}

function getApiList<T>(payload: unknown, collectionKeys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  const collection = record.data ?? collectionKeys
    .map((key) => record[key])
    .find(Array.isArray);

  return Array.isArray(collection) ? collection as T[] : [];
}

async function fetchApiList<T>(endpoint: string, collectionKeys: string[]): Promise<T[]> {
  const response = await fetch(`http://localhost:5001/api/${endpoint}`);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return getApiList<T>(await response.json(), collectionKeys);
}

const AdminFleetMap = dynamic(() => import('@/components/AdminFleetMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400">
      Loading Campus Transit Map...
    </div>
  ),
});

function DashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'realtime' | 'vehicles' | 'routes' | 'stops'>('realtime');
  const [stops, setStops] = useState<DashboardStop[]>([]);
  const [routes, setRoutes] = useState<DashboardRoute[]>([]);
  const [vehicles, setVehicles] = useState<DashboardVehicle[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeStopCounts, setRouteStopCounts] = useState<Record<string, number>>({});

  // Modal State for Assigning Route & Status
  const [assigningVehicle, setAssigningVehicle] = useState<DashboardVehicle | null>(null);
  const [targetRouteId, setTargetRouteId] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<string>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const handleRouteStopCountChange = useCallback((routeId: string, count: number) => {
    setRouteStopCounts((current) => current[routeId] === count
      ? current
      : { ...current, [routeId]: count });
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      // 1. Load Master Stops
      const stopsList = await fetchApiList<DashboardStop>('stops', ['stops']);
      setStops(stopsList);

      // 2. Load Base Routes
      const rawRoutes = await fetchApiList<DashboardRoute>('routes', ['routes']);

      // 3. Enrich Routes with their stop sequences/coordinates if not already populated
      const enrichedRoutes = await Promise.all(
        rawRoutes.map(async (route) => {
          // If the route already contains path or routeStops, return it directly
          if (
            (route.path && route.path.length > 0) ||
            (route.routeStops && route.routeStops.length > 0) ||
            (route.stops && route.stops.length > 0)
          ) {
            return route;
          }

          // Otherwise, fetch the assigned stops for this route
          try {
            const assignedStopsRes = await fetch(`http://localhost:5001/api/routes/${route.id}/stops`);
            if (assignedStopsRes.ok) {
              const assignedStopsData = await assignedStopsRes.json();
              const fetchedStops = getApiList<DashboardRouteStop>(assignedStopsData, ['stops', 'routeStops']);
              return {
                ...route,
                routeStops: fetchedStops,
              };
            }
          } catch {
            // Fallback: if individual route fetch fails, retain the original route
          }
          return route;
        })
      );

      setRoutes(enrichedRoutes);
      setSelectedRouteId((current) => current ?? enrichedRoutes[0]?.id ?? null);

      // 4. Load Vehicles
      const vehiclesList = await fetchApiList<DashboardVehicle>('vehicles', ['vehicles']);
      setVehicles(vehiclesList);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleLogout = () => {
    clearAdminToken();
    router.replace('/login');
  };

  const openAssignModal = (vehicle: DashboardVehicle) => {
    setAssigningVehicle(vehicle);
    setAssignmentError(null);
    setTargetRouteId(vehicle.assignedRouteId || vehicle.routeId || vehicle.currentRouteId || (routes[0]?.id ?? ''));
    setTargetStatus(vehicle.status || 'ACTIVE');
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningVehicle) return;

    setIsSubmitting(true);
    setAssignmentError(null);
    const vehicleId = assigningVehicle.id;
    const assignedRouteId = targetRouteId || null;

    try {
      const res = await fetch(`http://localhost:5001/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedRouteId,
          status: targetStatus,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
      }

      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? { ...v, assignedRouteId, status: targetStatus }
            : v
        )
      );

      setAssigningVehicle(null);
      fetchAllData();
    } catch (err) {
      console.error('Failed to assign route:', err);
      setAssignmentError(err instanceof Error ? err.message : 'Failed to assign route');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Log Out Button */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Operations Dashboard</h1>
            <p className="text-sm text-slate-400">
              Fleet monitoring, transit route control, and master stop directories.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Log Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'realtime'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Realtime Dashboard
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'vehicles'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Vehicles ({vehicles.length})
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'routes'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Routes ({routes.length})
          </button>

          <button
            onClick={() => setActiveTab('stops')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'stops'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Stops ({stops.length})
          </button>
        </div>

        {/* TAB 1: REALTIME DASHBOARD */}
        {activeTab === 'realtime' && (
          <div className="space-y-6">
            <section className="w-full h-[520px]">
              <AdminFleetMap stops={stops} routes={routes} />
            </section>
            <section className="w-full">
              <RealtimeFleetOverview />
            </section>
          </div>
        )}

        {/* TAB 2: VEHICLES DIRECTORY */}
        {activeTab === 'vehicles' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Transit Vehicles</h2>
                <p className="text-xs text-slate-400">Manage fleet assignment, operational readiness, and unit capacities.</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Total Fleet: {vehicles.length} Units
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {vehicles.map((v, idx) => {
                const isActive = (v.status || '').toUpperCase() === 'ACTIVE';
                const assignedRoute = routes.find((r) => r.id === (v.assignedRouteId || v.routeId || v.currentRouteId));

                return (
                  <div key={v.id || idx} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white text-base">
                          🚍 {v.name || v.plateNumber || `Shuttle ${v.id}`}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          ID: <span className="text-slate-300">{v.id}</span>
                        </div>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}>
                        {v.status || 'INACTIVE'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <span className="text-slate-500">Route: </span>
                      {assignedRoute ? (
                        <span className="font-medium text-blue-400">
                          {assignedRoute.name || assignedRoute.nameEn}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </div>

                    <div className="border-t border-slate-700/40 pt-2 text-xs text-slate-400 flex justify-between items-center">
                      <span>Capacity: <strong className="text-slate-200">{v.capacity || 20} seats</strong></span>
                      <button
                        onClick={() => openAssignModal(v)}
                        className="text-blue-400 hover:text-blue-300 hover:underline text-xs font-medium cursor-pointer"
                      >
                        Assign Route &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ROUTES DIRECTORY */}
        {activeTab === 'routes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Configured Transit Routes</h2>
              <p className="text-xs text-slate-400">Active campus loops, associated waypoints, and assigned stop sequences.</p>
            </div>

            <div className="space-y-3 pt-2">
              {routes.map((r, idx) => {
                const stopList = r.routeStops || r.stops || r.route_stops || r.RouteStop || [];
                const routeStopsCount = routeStopCounts[r.id] ?? (stopList.length || r.stopCount || 0);
                const isSelected = selectedRouteId === (r.id || `route-${idx}`);

                return (
                  <div
                    key={r.id || idx}
                    onClick={() => setSelectedRouteId(isSelected ? null : (r.id || `route-${idx}`))}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-base flex items-center gap-2">
                          <span>{r.name || r.nameEn || `Route ${idx + 1}`}</span>
                          {r.nameTh && <span className="text-xs text-slate-400 font-normal">({r.nameTh})</span>}
                        </div>
                        <div className="text-xs text-slate-400">
                          Assigned Stops: <strong className="text-slate-200">{routeStopsCount} stops</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: r.color || '#3b82f6' }}
                        />
                        <span className="text-slate-400 text-xs font-mono">{isSelected ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expandable Accordion Body */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-700/80 text-xs">
                        <RouteStopManager
                          key={r.id}
                          routeId={r.id}
                          allStops={stops}
                          onCountChange={handleRouteStopCountChange}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MASTER STOPS DIRECTORY */}
        {activeTab === 'stops' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Master Stops Directory</h2>
                <p className="text-xs text-slate-400">Authorized passenger pickup and dropoff points across campus.</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {stops.length} Configured Stops
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {stops.map((s, idx) => {
                const displayNameEn = s.nameEn || s.name || `Stop ${idx + 1}`;
                const displayNameTh = s.nameTh || null;
                const lat = Number(s.lat ?? s.latitude ?? 0);
                const lng = Number(s.lng ?? s.longitude ?? 0);

                return (
                  <div key={s.id || idx} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <div className="font-bold text-white text-base">{displayNameEn}</div>
                      </div>
                      {displayNameTh && (
                        <div className="text-xs text-slate-400 pl-6 mt-0.5">{displayNameTh}</div>
                      )}
                    </div>

                    <div className="border-t border-slate-700/40 pt-2 flex justify-between items-center font-mono text-[11px] text-slate-400">
                      <span>ID: <strong className="text-slate-300">{s.id || `S0${idx + 1}`}</strong></span>
                      <span>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN ROUTE & STATUS MODAL */}
      {assigningVehicle && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Assign Vehicle: {assigningVehicle.name || assigningVehicle.plateNumber || assigningVehicle.id}
              </h3>
              <button
                onClick={() => setAssigningVehicle(null)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {assignmentError && (
              <p role="alert" className="text-sm text-rose-400">{assignmentError}</p>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Active Route
                </label>
                <select
                  value={targetRouteId}
                  onChange={(e) => setTargetRouteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- No Route (Unassigned) --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.nameEn || `Route ${r.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Operational Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningVehicle(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminRouteGuard>
      <DashboardContent />
    </AdminRouteGuard>
  );
}