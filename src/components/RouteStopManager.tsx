'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Route, RouteStop, Stop } from '@/types/transport';
import { transportApi } from '@/services/apiClient';

interface RouteStopManagerProps {
  routeId?: string;
  routes?: Route[];
  allStops?: Stop[];
  onCountChange?: (routeId: string, count: number) => void;
}

function sortRouteStops(data: RouteStop[]): RouteStop[] {
  return [...data].sort(
    (a, b) => (a.stopOrder ?? a.sequenceOrder ?? 0) - (b.stopOrder ?? b.sequenceOrder ?? 0)
  );
}

export function RouteStopManager({
  routeId: initialRouteId,
  routes: propRoutes,
  allStops: propStops,
  onCountChange,
}: RouteStopManagerProps) {
  const [fetchedRoutes, setFetchedRoutes] = useState<Route[]>([]);
  const [fetchedStops, setFetchedStops] = useState<Stop[]>([]);
  const [selectedRouteIdState, setSelectedRouteIdState] = useState(initialRouteId || '');
  const [loadedRouteStops, setLoadedRouteStops] = useState<{ routeId: string; stops: RouteStop[] } | null>(null);
  const [selectedStopToAdd, setSelectedStopToAdd] = useState('');
  const [actionError, setActionError] = useState<{ routeId: string; message: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const routes = propRoutes?.length ? propRoutes : fetchedRoutes;
  const allStops = propStops?.length ? propStops : fetchedStops;
  const selectedRouteId = initialRouteId || selectedRouteIdState;
  const routeStops = loadedRouteStops?.routeId === selectedRouteId ? loadedRouteStops.stops : [];
  const currentError = actionError?.routeId === selectedRouteId ? actionError.message : null;
  const loading = Boolean(selectedRouteId && loadedRouteStops?.routeId !== selectedRouteId && !currentError);
  const availableStops = allStops.filter((stop) =>
    !routeStops.some((routeStop) => (routeStop.stopId || routeStop.stop?.id) === stop.id)
  );

  useEffect(() => {
    let isCurrent = true;

    if (!initialRouteId && (!propRoutes || propRoutes.length === 0)) {
      transportApi.getRoutes()
        .then((data) => {
          if (isCurrent) setFetchedRoutes(data);
        })
        .catch((error: unknown) => {
          if (isCurrent) setLoadError(error instanceof Error ? error.message : 'Failed to load routes');
        });
    }

    if (!propStops || propStops.length === 0) {
      transportApi.getStops()
        .then((data) => {
          if (isCurrent) setFetchedStops(data);
        })
        .catch((error: unknown) => {
          if (isCurrent) setLoadError(error instanceof Error ? error.message : 'Failed to load master stops');
        });
    }

    return () => {
      isCurrent = false;
    };
  }, [initialRouteId, propRoutes, propStops]);

  const loadRouteStops = useCallback(async (routeId: string) => {
    if (!routeId) return;

    try {
      const stops = sortRouteStops(await transportApi.getRouteStops(routeId));
      setLoadedRouteStops({ routeId, stops });
      onCountChange?.(routeId, stops.length);
      setActionError((current) => current?.routeId === routeId ? null : current);
    } catch (error: unknown) {
      setActionError({
        routeId,
        message: error instanceof Error ? error.message : 'Failed to load route stops',
      });
    }
  }, [onCountChange]);

  useEffect(() => {
    if (!selectedRouteId) return;

    let isCurrent = true;
    transportApi.getRouteStops(selectedRouteId)
      .then((data) => {
        if (!isCurrent) return;
        const stops = sortRouteStops(data);
        setLoadedRouteStops({ routeId: selectedRouteId, stops });
        onCountChange?.(selectedRouteId, stops.length);
        setActionError((current) => current?.routeId === selectedRouteId ? null : current);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setActionError({
          routeId: selectedRouteId,
          message: error instanceof Error ? error.message : 'Failed to load route stops',
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [onCountChange, selectedRouteId]);

  const handleAddStop = async () => {
    if (!selectedRouteId || !selectedStopToAdd) return;

    setIsMutating(true);
    setActionError(null);
    try {
      const nextStopOrder = Math.max(
        0,
        ...routeStops.map((stop) => stop.stopOrder ?? stop.sequenceOrder ?? 0)
      ) + 1;
      await transportApi.addStopToRoute(selectedRouteId, selectedStopToAdd, nextStopOrder);
      setSelectedStopToAdd('');
      await loadRouteStops(selectedRouteId);
    } catch (error: unknown) {
      setActionError({
        routeId: selectedRouteId,
        message: error instanceof Error ? error.message : 'Failed to add stop',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleRemoveStop = async (routeStopId: string) => {
    if (!selectedRouteId || !window.confirm('Remove this stop from the route?')) return;

    setIsMutating(true);
    setActionError(null);
    try {
      await transportApi.removeStopFromRoute(routeStopId);
      await loadRouteStops(selectedRouteId);
    } catch (error: unknown) {
      setActionError({
        routeId: selectedRouteId,
        message: error instanceof Error ? error.message : 'Failed to remove stop',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const moveStop = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!selectedRouteId || isMutating) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= routeStops.length) return;

    const reordered = [...routeStops];
    const [movedStop] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedStop);
    const updates = reordered.map((stop, orderIndex) => ({
      routeStopId: stop.id,
      stopOrder: orderIndex + 1,
      previousStopOrder: stop.stopOrder,
    }));

    setIsMutating(true);
    setActionError(null);
    try {
      await transportApi.reorderRouteStops(updates);
      await loadRouteStops(selectedRouteId);
    } catch (error: unknown) {
      await loadRouteStops(selectedRouteId);
      setActionError({
        routeId: selectedRouteId,
        message: error instanceof Error ? error.message : 'Failed to reorder stops',
      });
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-4 text-white" onClick={(event) => event.stopPropagation()}>
      {loadError && (
        <p role="alert" className="text-sm text-rose-400">{loadError}</p>
      )}
      {currentError && (
        <p role="alert" className="text-sm text-rose-400">{currentError}</p>
      )}

      {!initialRouteId && (
        <div>
          <label className="mb-1 block text-xs text-slate-400" htmlFor="route-stop-route-select">Select Route</label>
          <select
            id="route-stop-route-select"
            className="w-full rounded border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            value={selectedRouteId}
            onChange={(event) => setSelectedRouteIdState(event.target.value)}
          >
            <option value="">-- Choose a Route --</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>{route.code} - {route.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedRouteId && (
        <>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor={`master-stop-${selectedRouteId}`}>Master stop to add</label>
            <select
              id={`master-stop-${selectedRouteId}`}
              className="w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              value={selectedStopToAdd}
              onChange={(event) => {
                setSelectedStopToAdd(event.target.value);
                setActionError(null);
              }}
              disabled={loading || isMutating || availableStops.length === 0}
            >
              <option value="">
                {availableStops.length ? '-- Add a Master Stop --' : 'All Master Stops are assigned'}
              </option>
              {availableStops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.nameEn || stop.name || stop.nameTh || `Stop ${stop.id}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddStop}
              disabled={!selectedStopToAdd || isMutating || loading}
              className="shrink-0 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {isMutating ? 'Saving...' : 'Add Stop'}
            </button>
          </div>

          <div className="divide-y divide-slate-800 border-t border-slate-800">
            {loading ? (
              <p className="py-3 text-sm text-slate-400">Loading stops...</p>
            ) : routeStops.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">No stops assigned to this route yet.</p>
            ) : (
              routeStops.map((routeStop, index) => (
                <div key={routeStop.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                      {routeStop.stopOrder ?? routeStop.sequenceOrder ?? index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {routeStop.stop?.nameEn || routeStop.stop?.name || routeStop.stop?.nameTh || routeStop.name || `Stop ${routeStop.stopId}`}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {routeStop.stop?.code || routeStop.code || routeStop.stopId}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void moveStop(index, 'UP')}
                      disabled={index === 0 || isMutating || loading}
                      className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                      title="Move Up"
                      aria-label="Move stop up"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => void moveStop(index, 'DOWN')}
                      disabled={index === routeStops.length - 1 || isMutating || loading}
                      className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                      title="Move Down"
                      aria-label="Move stop down"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRemoveStop(routeStop.id)}
                      disabled={isMutating || loading}
                      className="rounded border border-rose-900 bg-rose-950/70 px-2.5 py-1 text-xs text-rose-300 transition hover:bg-rose-900 disabled:opacity-50"
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
