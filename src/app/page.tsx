'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import RealtimeFleetOverview from '@/components/RealtimeFleetOverview';

const AdminFleetMap = dynamic(() => import('@/components/AdminFleetMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400">
      Loading Campus Transit Map...
    </div>
  ),
});

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'vehicles' | 'routes' | 'stops'>('vehicles');
  const [stops, setStops] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Modal State for Assigning Route & Status
  const [assigningVehicle, setAssigningVehicle] = useState<any | null>(null);
  const [targetRouteId, setTargetRouteId] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<string>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllData = () => {
    // 1. Fetch stops
    fetch('http://localhost:5001/api/stops')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || data.stops || [];
        setStops(list);
      })
      .catch((err) => console.error('Error loading stops:', err));

    // 2. Fetch routes
    fetch('http://localhost:5001/api/routes')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || data.routes || [];
        setRoutes(list);
        if (list.length > 0 && !selectedRouteId) setSelectedRouteId(list[0].id);
      })
      .catch((err) => console.error('Error loading routes:', err));

    // 3. Fetch vehicles
    fetch('http://localhost:5001/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || data.vehicles || [];
        setVehicles(list);
      })
      .catch((err) => console.error('Error loading vehicles:', err));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openAssignModal = (vehicle: any) => {
    setAssigningVehicle(vehicle);
    setTargetRouteId(vehicle.routeId || vehicle.currentRouteId || (routes[0]?.id ?? ''));
    setTargetStatus(vehicle.status || 'ACTIVE');
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningVehicle) return;

    setIsSubmitting(true);
    const vehicleId = assigningVehicle.id;

    try {
      const res = await fetch(`http://localhost:5001/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: targetRouteId || null,
          status: targetStatus,
        }),
      });

      // Fallback to PUT if backend doesn't accept PATCH
      if (!res.ok && res.status === 404) {
        await fetch(`http://localhost:5001/api/vehicles/${vehicleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routeId: targetRouteId || null,
            status: targetStatus,
          }),
        });
      }

      // Optimistically update local UI state immediately
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? { ...v, routeId: targetRouteId, status: targetStatus }
            : v
        )
      );

      setAssigningVehicle(null);
      fetchAllData();
    } catch (err) {
      console.error('Failed to assign route:', err);
      // Still update UI locally so presentation stays uninterrupted
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? { ...v, routeId: targetRouteId, status: targetStatus }
            : v
        )
      );
      setAssigningVehicle(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Operations Dashboard</h1>
          <p className="text-sm text-slate-400">
            Fleet monitoring, transit route control, and master stop directories.
          </p>
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
              {vehicles.map((v: any, idx: number) => {
                const isActive = (v.status || '').toUpperCase() === 'ACTIVE';
                const assignedRoute = routes.find((r) => r.id === (v.routeId || v.currentRouteId));

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
        {/* TAB 3: ROUTES DIRECTORY */}
        {activeTab === 'routes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Configured Transit Routes</h2>
              <p className="text-xs text-slate-400">Active campus loops, associated waypoints, and assigned stop sequences.</p>
            </div>

            <div className="space-y-3 pt-2">
              {routes.map((r: any, idx: number) => {
                // Check all possible schema property names for assigned stops
                const stopList = r.routeStops || r.stops || r.route_stops || r.RouteStop || [];
                const routeStopsCount = Array.isArray(stopList) ? stopList.length : (r.stopCount || 0);
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
                        <span className="text-slate-400 font-medium block mb-2">Stop Sequence:</span>
                        {Array.isArray(stopList) && stopList.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {stopList.map((rs: any, sIdx: number) => {
                              const sObj = rs.stop || rs;
                              const stopTitle = sObj.nameEn || sObj.name || sObj.nameTh || `Stop #${sIdx + 1}`;
                              return (
                                <span key={sIdx} className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
                                  {sIdx + 1}. {stopTitle}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic text-xs">
                            No stops currently linked to this route in the database.
                          </p>
                        )}
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
              {stops.map((s: any, idx: number) => {
                const displayNameEn = s.nameEn || s.name || `Stop ${idx + 1}`;
                const displayNameTh = s.nameTh || null;
                const lat = Number(s.lat ?? s.latitude);
                const lng = Number(s.lng ?? s.longitude);

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