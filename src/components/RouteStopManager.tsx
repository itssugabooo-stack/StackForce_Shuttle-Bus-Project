'use client';

import React, { useState, useEffect } from 'react';
import { Route, Stop, RouteStop } from '@/types/transport';
import { transportApi } from '@/services/apiClient';

interface RouteStopManagerProps {
  routes?: Route[];
  allStops?: Stop[];
}

export function RouteStopManager({ routes: propRoutes, allStops: propStops }: RouteStopManagerProps) {
  const [routes, setRoutes] = useState<Route[]>(propRoutes || []);
  const [allStops, setAllStops] = useState<Stop[]>(propStops || []);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [selectedStopToAdd, setSelectedStopToAdd] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync props if provided
  useEffect(() => {
    if (propRoutes && propRoutes.length > 0) setRoutes(propRoutes);
    if (propStops && propStops.length > 0) setAllStops(propStops);
  }, [propRoutes, propStops]);

  // Fetch routes and stops if not passed as props
  useEffect(() => {
    if (!propRoutes || propRoutes.length === 0) {
      transportApi.getRoutes().then(setRoutes).catch(console.error);
    }
    if (!propStops || propStops.length === 0) {
      transportApi.getStops().then(setAllStops).catch(console.error);
    }
  }, [propRoutes, propStops]);

  // Load stops belonging to the selected route
  const loadRouteStops = async (routeId: string) => {
    if (!routeId) {
      setRouteStops([]);
      return;
    }
    setLoading(true);
    setActionError(null);
    try {
      const data = await transportApi.getRouteStops(routeId);
      // Sort by stopOrder / sequenceOrder ascending
      const sorted = (data || []).sort(
        (a: RouteStop, b: RouteStop) => (a.stopOrder ?? a.sequenceOrder ?? 0) - (b.stopOrder ?? b.sequenceOrder ?? 0)
      );
      setRouteStops(sorted);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load route stops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteStops(selectedRouteId);
  }, [selectedRouteId]);

  // Add a stop to the current route
  const handleAddStop = async () => {
    if (!selectedRouteId || !selectedStopToAdd) return;
    const nextOrder = routeStops.length + 1;
    setActionError(null);
    try {
      if ((transportApi as any).addStopToRoute) {
        await (transportApi as any).addStopToRoute(selectedRouteId, selectedStopToAdd, nextOrder);
      }
      setSelectedStopToAdd('');
      loadRouteStops(selectedRouteId);
    } catch (err: any) {
      setActionError(err.message || 'Error adding stop to route');
    }
  };

  // Remove a stop from the route
  const handleRemove = async (stopIdToRemove: string) => {
    if (!confirm('Remove this stop from route?')) return;
    setActionError(null);
    try {
      if ((transportApi as any).removeStopFromRoute) {
        await (transportApi as any).removeStopFromRoute(selectedRouteId, stopIdToRemove);
      }
      loadRouteStops(selectedRouteId);
    } catch (err: any) {
      setActionError(err.message || 'Error removing stop');
    }
  };

  // Reorder stop sequence (Up / Down)
  const moveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= routeStops.length) return;

    const reordered = [...routeStops];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updated = reordered.map((item, idx) => ({
      ...item,
      stopOrder: idx + 1,
      sequenceOrder: idx + 1,
    }));

    setRouteStops(updated);

    try {
      if ((transportApi as any).reorderRouteStops) {
        const payload = updated.map((item) => ({
          routeStopId: item.routeStopId || item.id,
          stopId: item.stopId,
          sequenceOrder: item.stopOrder,
          stopOrder: item.stopOrder,
        }));
        await (transportApi as any).reorderRouteStops(selectedRouteId, payload);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to update order');
      loadRouteStops(selectedRouteId);
    }
  };

  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-white space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Route Stops Sequence</h3>
        <p className="text-xs text-slate-400">View, add, remove, and define the stop sequence order</p>
      </div>

      {actionError && (
        <div className="p-2.5 rounded text-xs bg-rose-950/80 text-rose-300 border border-rose-800">
          {actionError}
        </div>
      )}

      <div>
        <label className="text-xs text-slate-400 block mb-1">Select Route</label>
        <select
          className="p-2.5 bg-slate-800 border border-slate-700 rounded text-sm w-full focus:outline-none focus:border-blue-500 text-slate-200"
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
        >
          <option value="">-- Choose a Route --</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.code} - {r.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRouteId && (
        <>
          <div className="flex gap-2">
            <select
              className="p-2 bg-slate-800 border border-slate-700 rounded text-sm w-full focus:outline-none focus:border-blue-500 text-slate-200"
              value={selectedStopToAdd}
              onChange={(e) => setSelectedStopToAdd(e.target.value)}
            >
              <option value="">-- Add Stop to this Route --</option>
              {allStops
                .filter((s) => !routeStops.some((rs) => rs.stopId === s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
            </select>
            <button
              onClick={handleAddStop}
              disabled={!selectedStopToAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-sm font-medium transition cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="divide-y divide-slate-800 border-t border-slate-800 pt-2">
            {loading ? (
              <p className="text-sm text-slate-400 py-3">Loading stops...</p>
            ) : routeStops.length === 0 ? (
              <p className="text-sm text-slate-500 py-3">No stops assigned to this route yet.</p>
            ) : (
              routeStops.map((rs, idx) => (
                <div
                  key={rs.id || rs.routeStopId || `${rs.stopId}-${idx}`}
                  className="py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                      {rs.stopOrder ?? rs.sequenceOrder ?? idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{rs.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{rs.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveOrder(idx, 'UP')}
                      disabled={idx === 0}
                      className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveOrder(idx, 'DOWN')}
                      disabled={idx === routeStops.length - 1}
                      className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(rs.routeStopId || rs.id || rs.stopId)}
                      className="ml-2 px-2.5 py-1 bg-rose-950/70 text-rose-300 border border-rose-900 rounded text-xs hover:bg-rose-900 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RouteStopManager;