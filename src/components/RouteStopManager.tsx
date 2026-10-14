'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Route, Stop, RouteStop } from '@/types/transport';
import { transportApi } from '@/services/apiClient';

interface RouteStopActions {
  addStopToRoute?: (routeId: string, stopId: string, stopOrder: number) => Promise<unknown>;
  removeStopFromRoute?: (routeId: string, routeStopId: string) => Promise<unknown>;
  reorderRouteStops?: (
    routeId: string,
    payload: Array<{
      routeStopId: string;
      stopId: string;
      sequenceOrder: number;
      stopOrder: number;
    }>
  ) => Promise<unknown>;
}

const routeStopActions = transportApi as typeof transportApi & RouteStopActions;

interface RouteStopManagerProps {
  routeId?: string;
  routes?: Route[];
  allStops?: Stop[];
}

function sortRouteStops(data: RouteStop[]): RouteStop[] {
  return [...data].sort(
    (a, b) => (a.stopOrder ?? a.sequenceOrder ?? 0) - (b.stopOrder ?? b.sequenceOrder ?? 0)
  );
}

export function RouteStopManager({ routeId: initialRouteId, routes: propRoutes, allStops: propStops }: RouteStopManagerProps) {
  const [fetchedRoutes, setFetchedRoutes] = useState<Route[]>([]);
  const [fetchedStops, setFetchedStops] = useState<Stop[]>([]);
  const routes = propRoutes?.length ? propRoutes : fetchedRoutes;
  const allStops = propStops?.length ? propStops : fetchedStops;
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRouteId || '');
  const [previousInitialRouteId, setPreviousInitialRouteId] = useState(initialRouteId);
  const [loadedRouteStops, setLoadedRouteStops] = useState<{ routeId: string; stops: RouteStop[] } | null>(null);
  const [selectedStopToAdd, setSelectedStopToAdd] = useState<string>('');
  const [actionError, setActionError] = useState<{ routeId: string; message: string } | null>(null);

  if (previousInitialRouteId !== initialRouteId) {
    setPreviousInitialRouteId(initialRouteId);
    setSelectedRouteId(initialRouteId || '');
  }

  const routeStops = loadedRouteStops?.routeId === selectedRouteId ? loadedRouteStops.stops : [];
  const currentError = actionError?.routeId === selectedRouteId ? actionError.message : null;
  const loading = Boolean(selectedRouteId && loadedRouteStops?.routeId !== selectedRouteId && !currentError);

  // Fetch routes and stops if not passed as props
  useEffect(() => {
    let isCurrent = true;
    if (!propRoutes || propRoutes.length === 0) {
      transportApi.getRoutes().then((data) => {
        if (isCurrent) setFetchedRoutes(data);
      }).catch(console.error);
    }
    if (!propStops || propStops.length === 0) {
      transportApi.getStops().then((data) => {
        if (isCurrent) setFetchedStops(data);
      }).catch(console.error);
    }

    return () => {
      isCurrent = false;
    };
  }, [propRoutes, propStops]);

  // Load stops belonging to the selected route
  const loadRouteStops = useCallback(async (routeId: string) => {
    if (!routeId) return;
    try {
      const data = await transportApi.getRouteStops(routeId);
      setLoadedRouteStops({ routeId, stops: sortRouteStops(data || []) });
      setActionError((current) => current?.routeId === routeId ? null : current);
    } catch (err: unknown) {
      setActionError({
        routeId,
        message: err instanceof Error ? err.message : 'Failed to load route stops',
      });
    }
  }, []);

  useEffect(() => {
    if (!selectedRouteId) return;

    let isCurrent = true;
    transportApi.getRouteStops(selectedRouteId)
      .then((data) => {
        if (!isCurrent) return;
        setLoadedRouteStops({ routeId: selectedRouteId, stops: sortRouteStops(data || []) });
        setActionError((current) => current?.routeId === selectedRouteId ? null : current);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setActionError({
          routeId: selectedRouteId,
          message: err instanceof Error ? err.message : 'Failed to load route stops',
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedRouteId]);

  // Add a stop to the current route
  const handleAddStop = async () => {
    if (!selectedRouteId || !selectedStopToAdd) return;
    const nextOrder = routeStops.length + 1;
    setActionError(null);
    try {
      if (routeStopActions.addStopToRoute) {
        await routeStopActions.addStopToRoute(selectedRouteId, selectedStopToAdd, nextOrder);
      }
      setSelectedStopToAdd('');
      void loadRouteStops(selectedRouteId);
    } catch (err: unknown) {
      setActionError({
        routeId: selectedRouteId,
        message: err instanceof Error ? err.message : 'Error adding stop to route',
      });
    }
  };

  // Remove a stop from the route
  const handleRemove = async (stopIdToRemove: string) => {
    if (!confirm('Remove this stop from route?')) return;
    setActionError(null);
    try {
      if (routeStopActions.removeStopFromRoute) {
        await routeStopActions.removeStopFromRoute(selectedRouteId, stopIdToRemove);
      }
      void loadRouteStops(selectedRouteId);
    } catch (err: unknown) {
      setActionError({
        routeId: selectedRouteId,
        message: err instanceof Error ? err.message : 'Error removing stop',
      });
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

    setLoadedRouteStops({ routeId: selectedRouteId, stops: updated });

    try {
      if (routeStopActions.reorderRouteStops) {
        const payload = updated.map((item) => ({
          routeStopId: item.routeStopId || item.id,
          stopId: item.stopId,
          sequenceOrder: item.stopOrder,
          stopOrder: item.stopOrder,
        }));
        await routeStopActions.reorderRouteStops(selectedRouteId, payload);
      }
    } catch (err: unknown) {
      setActionError({
        routeId: selectedRouteId,
        message: err instanceof Error ? err.message : 'Failed to update order',
      });
      void loadRouteStops(selectedRouteId);
    }
  };

  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-white space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Route Stops Sequence</h3>
        <p className="text-xs text-slate-400">View, add, remove, and define the stop sequence order</p>
      </div>

      {currentError && (
        <div className="p-2.5 rounded text-xs bg-rose-950/80 text-rose-300 border border-rose-800">
          {currentError}
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