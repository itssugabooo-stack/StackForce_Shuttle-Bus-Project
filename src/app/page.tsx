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

// FIX: use the backend address from .env.local (NEXT_PUBLIC_API_URL), the same way
// apiClient.ts does, instead of a hard-coded localhost address.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

async function fetchApiList<T>(endpoint: string, collectionKeys: string[]): Promise<T[]> {
  const response = await fetch(`${API_ORIGIN}/api/${endpoint}`);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return getApiList<T>(await response.json(), collectionKeys);
}

const AdminFleetMap = dynamic(() => import('@/components/AdminFleetMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] rounded-2xl border border-slate-200 bg-white flex items-center justify-center gap-3 text-sm text-slate-500">
      <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
      Loading the campus map…
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
            const assignedStopsRes = await fetch(`${API_ORIGIN}/api/routes/${route.id}/stops`);
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
      const res = await fetch(`${API_ORIGIN}/api/vehicles/${vehicleId}`, {
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

  const activeVehicleCount = vehicles.filter((v) => (v.status || '').toUpperCase() === 'ACTIVE').length;
  const routeById = (id?: string | null) => routes.find((r) => r.id === id);

  const tabs: { id: typeof activeTab; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'realtime', label: 'Live map', icon: <IconMap /> },
    { id: 'vehicles', label: 'Vehicles', count: vehicles.length, icon: <IconBus /> },
    { id: 'routes', label: 'Routes', count: routes.length, icon: <IconRoute /> },
    { id: 'stops', label: 'Stops', count: stops.length, icon: <IconPin /> },
  ];

  const pageTitle: Record<typeof activeTab, { title: string; text: string }> = {
    realtime: { title: 'Live fleet', text: 'Every shuttle on campus, updated as it moves.' },
    vehicles: { title: 'Vehicles', text: 'Assign each shuttle to a route and set its status.' },
    routes: { title: 'Routes', text: 'Choose which stops each route serves, in driving order.' },
    stops: { title: 'Stops', text: 'All pickup and drop-off points on campus.' },
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-[1100] border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <IconBus className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="font-[family-name:var(--font-display)] text-[17px] font-bold text-[#0b1220]">Fleet Admin</div>
              <div className="text-xs text-slate-500">RSU Campus Shuttle</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1" aria-label="Dashboard sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                aria-current={activeTab === t.id ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  activeTab === t.id
                    ? 'bg-white text-[#0b1220] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className={activeTab === t.id ? 'text-blue-600' : ''}>{t.icon}</span>
                {t.label}
                {t.count !== undefined && (
                  <span className="tabular rounded-md bg-slate-200/70 px-1.5 text-xs font-semibold text-slate-600">{t.count}</span>
                )}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <IconLogout />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>

        {/* Tabs on phones */}
        <nav className="md:hidden flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2" aria-label="Dashboard sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              aria-current={activeTab === t.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeTab === t.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && <span className="tabular text-xs opacity-70">{t.count}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[#0b1220] sm:text-[28px]">
              {pageTitle[activeTab].title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{pageTitle[activeTab].text}</p>
          </div>
        </div>

        {/* TAB 1: LIVE MAP */}
        {activeTab === 'realtime' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
              <StatCard label="Vehicles" value={vehicles.length} hint={`${activeVehicleCount} active`} tone="blue" icon={<IconBus />} />
              <StatCard label="Active vehicles" value={activeVehicleCount} hint="Ready to drive" tone="green" icon={<IconPulse />} />
              <StatCard label="Routes" value={routes.length} hint="Campus loops" tone="orange" icon={<IconRoute />} />
              <StatCard label="Stops" value={stops.length} hint="Pickup points" tone="violet" icon={<IconPin />} />
            </div>
            <section className="h-[560px] w-full">
              <AdminFleetMap stops={stops} routes={routes} />
            </section>
            <section className="w-full">
              <RealtimeFleetOverview />
            </section>
          </div>
        )}

        {/* TAB 2: VEHICLES */}
        {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.length === 0 && <EmptyCard text="No vehicles yet. They appear here once the backend has them." />}
            {[...vehicles]
              .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))
              .map((v, idx) => {
              const assignedRoute = routeById(v.assignedRouteId || v.routeId || v.currentRouteId);
              return (
                <div key={v.id || idx} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <IconBus className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="font-semibold text-[#0b1220]">{v.name || v.plateNumber || `Shuttle ${v.id}`}</div>
                        <div className="font-mono text-xs text-slate-500">{v.id}</div>
                      </div>
                    </div>
                    <StatusPill status={v.status} />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Route</dt>
                      <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                        {assignedRoute ? (
                          <>
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: assignedRoute.color || '#2563eb' }} />
                            <span className="truncate text-slate-800">{assignedRoute.id}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </dd>
                    </div>
                    {v.capacity != null && (
                      <div>
                        <dt className="text-xs text-slate-500">Capacity</dt>
                        <dd className="tabular mt-0.5 font-medium text-slate-800">{v.capacity} seats</dd>
                      </div>
                    )}
                  </dl>

                  <button
                    type="button"
                    onClick={() => openAssignModal(v)}
                    className="mt-auto rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    Change route or status
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: ROUTES */}
        {activeTab === 'routes' && (
          <div className="space-y-3">
            {routes.length === 0 && <EmptyCard text="No routes yet." />}
            {routes.map((r, idx) => {
              const stopList = r.routeStops || r.stops || r.route_stops || r.RouteStop || [];
              const routeStopsCount = routeStopCounts[r.id] ?? (stopList.length || r.stopCount || 0);
              const isSelected = selectedRouteId === (r.id || `route-${idx}`);
              const color = r.color || '#2563eb';

              return (
                <div
                  key={r.id || idx}
                  className={`overflow-hidden rounded-2xl border bg-white transition ${
                    isSelected ? 'border-blue-300 shadow-[0_8px_24px_rgba(11,18,32,0.06)]' : 'border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedRouteId(isSelected ? null : (r.id || `route-${idx}`))}
                    aria-expanded={isSelected}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="rounded-lg px-2.5 py-1 text-sm font-bold text-white" style={{ backgroundColor: color }}>
                        {r.id}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#0b1220]">
                          {r.name || r.nameEn || `Route ${idx + 1}`}
                        </div>
                        <div className="text-sm text-slate-500">
                          {r.nameTh && <span>{r.nameTh} · </span>}
                          <span className="tabular">{routeStopsCount} stops</span>
                        </div>
                      </div>
                    </div>
                    <IconChevron className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                  </button>

                  {isSelected && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5">
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
        )}

        {/* TAB 4: STOPS */}
        {activeTab === 'stops' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {stops.length === 0 && <div className="p-6"><EmptyCard text="No stops yet." /></div>}
            <ul className="divide-y divide-slate-100">
              {stops.map((s, idx) => {
                const displayNameEn = s.nameEn || s.name || `Stop ${idx + 1}`;
                const displayNameTh = s.nameTh || null;
                const lat = Number(s.lat ?? s.latitude ?? 0);
                const lng = Number(s.lng ?? s.longitude ?? 0);

                return (
                  <li key={s.id || idx} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <IconPin />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#0b1220]">{displayNameEn}</div>
                        {displayNameTh && <div className="truncate text-sm text-slate-500">{displayNameTh}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="tabular hidden font-mono text-slate-400 sm:inline">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono font-semibold text-slate-600">
                        {s.id || `S0${idx + 1}`}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>

      {/* ASSIGN ROUTE & STATUS MODAL */}
      {assigningVehicle && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="assign-title" className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="assign-title" className="font-[family-name:var(--font-display)] text-lg font-bold text-[#0b1220]">
                  {assigningVehicle.name || assigningVehicle.plateNumber || assigningVehicle.id}
                </h3>
                <p className="text-sm text-slate-500">Change the route and status of this shuttle.</p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningVehicle(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <IconClose />
              </button>
            </div>

            {assignmentError && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{assignmentError}</p>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label htmlFor="assign-route" className="mb-1.5 block text-sm font-medium text-slate-700">Route</label>
                <select
                  id="assign-route"
                  value={targetRouteId}
                  onChange={(e) => setTargetRouteId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                >
                  <option value="">No route (unassigned)</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} · {r.name || r.nameEn || `Route ${r.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="assign-status" className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <select
                  id="assign-status"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningVehicle(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small UI pieces ---------- */

const TONES = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  violet: 'bg-violet-50 text-violet-600',
} as const;

function StatCard({ label, value, hint, tone, icon }: {
  label: string;
  value: number;
  hint: string;
  tone: keyof typeof TONES;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone]}`}>{icon}</span>
      </div>
      <div className="tabular mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#0b1220]">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

function StatusPill({ status }: { status?: string }) {
  const s = (status || 'INACTIVE').toUpperCase();
  const style =
    s === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      : s === 'MAINTENANCE'
      ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
      : 'bg-slate-100 text-slate-600 ring-slate-500/20';
  const dot = s === 'ACTIVE' ? 'bg-emerald-500' : s === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-slate-400';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

type IconProps = { className?: string };
const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function IconBus({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="4" y="3" width="16" height="14" rx="3" />
      <path d="M4 11h16M8 21v-2M16 21v-2M7.5 14.5h.01M16.5 14.5h.01" />
    </svg>
  );
}
function IconMap({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
function IconRoute({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" />
    </svg>
  );
}
function IconPin({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
function IconPulse({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}
function IconLogout({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
    </svg>
  );
}
function IconChevron({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconClose({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <AdminRouteGuard>
      <DashboardContent />
    </AdminRouteGuard>
  );
}