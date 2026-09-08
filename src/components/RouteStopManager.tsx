'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportApi } from '@/services/apiClient';
import { RouteStop, Stop } from '@/types/transport';

const DEMO_ROUTE_STOPS: RouteStop[] = [
  { routeStopId: 'rs-1', stopId: 's-1', name: 'Central Station Terminal', code: 'CST-01', sequenceOrder: 1 },
  { routeStopId: 'rs-2', stopId: 's-2', name: 'University Main Gate', code: 'UMG-02', sequenceOrder: 2 },
  { routeStopId: 'rs-3', stopId: 's-3', name: 'Tech Park Business Center', code: 'TPB-03', sequenceOrder: 3 },
];

const DEMO_ALL_STOPS: Stop[] = [
  { id: 's-1', name: 'Central Station Terminal', code: 'CST-01', latitude: 13.7563, longitude: 100.5018 },
  { id: 's-2', name: 'University Main Gate', code: 'UMG-02', latitude: 13.7650, longitude: 100.5100 },
  { id: 's-3', name: 'Tech Park Business Center', code: 'TPB-03', latitude: 13.7720, longitude: 100.5250 },
  { id: 's-4', name: 'North Market Plaza', code: 'NMP-04', latitude: 13.7800, longitude: 100.5350 },
  { id: 's-5', name: 'City Hospital South Wing', code: 'CHS-05', latitude: 13.7900, longitude: 100.5450 },
];

interface Props {
  routeId: string;
}

export function RouteStopManager({ routeId }: Props) {
  const queryClient = useQueryClient();
  const [localStops, setLocalStops] = useState<RouteStop[]>(DEMO_ROUTE_STOPS);
  const [selectedStopId, setSelectedStopId] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const { data: routeStopsData } = useQuery({
    queryKey: ['routeStops', routeId],
    queryFn: () => transportApi.getRouteStops(routeId),
    retry: false,
  });

  const { data: allStopsData } = useQuery({
    queryKey: ['stops'],
    queryFn: transportApi.getStops,
    retry: false,
  });

  const effectiveAllStops = allStopsData && allStopsData.length > 0 ? allStopsData : DEMO_ALL_STOPS;

  useEffect(() => {
    if (routeStopsData && routeStopsData.length > 0) {
      const sorted = [...routeStopsData].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      setLocalStops(sorted);
    } else {
      setLocalStops(DEMO_ROUTE_STOPS);
    }
    setIsDirty(false);
  }, [routeStopsData]);

  const addStopMutation = useMutation({
    mutationFn: (stopId: string) =>
      transportApi.addStopToRoute(routeId, stopId, localStops.length + 1),
    onSuccess: () => {
      setSelectedStopId('');
      queryClient.invalidateQueries({ queryKey: ['routeStops', routeId] });
    },
    onError: () => {
      // Local fallback for testing without backend
      const found = effectiveAllStops.find((s) => s.id === selectedStopId);
      if (found) {
        setLocalStops((prev) => [
          ...prev,
          {
            routeStopId: `rs-${Date.now()}`,
            stopId: found.id,
            name: found.name,
            code: found.code,
            sequenceOrder: prev.length + 1,
          },
        ]);
        setSelectedStopId('');
        setIsDirty(true);
      }
    },
  });

  const removeStopMutation = useMutation({
    mutationFn: (routeStopId: string) =>
      transportApi.removeStopFromRoute(routeId, routeStopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routeStops', routeId] });
    },
    onError: (_err, routeStopId) => {
      setLocalStops((prev) =>
        prev
          .filter((s) => s.routeStopId !== routeStopId)
          .map((s, idx) => ({ ...s, sequenceOrder: idx + 1 }))
      );
      setIsDirty(true);
    },
  });

  const saveOrderMutation = useMutation({
    mutationFn: (reordered: RouteStop[]) => {
      const payload = reordered.map((s, index) => ({
        stopId: s.stopId,
        sequenceOrder: index + 1,
      }));
      return transportApi.reorderRouteStops(routeId, payload);
    },
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['routeStops', routeId] });
    },
    onError: () => {
      setIsDirty(false);
    },
  });

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localStops.length) return;

    const updated = [...localStops];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    const reindexed = updated.map((item, idx) => ({
      ...item,
      sequenceOrder: idx + 1,
    }));

    setLocalStops(reindexed);
    setIsDirty(true);
  };

  const availableStops = effectiveAllStops.filter(
    (stop) => !localStops.some((rs) => rs.stopId === stop.id)
  );

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Route Sequence & Stops</h2>
          <p className="text-xs text-slate-400">Order stops sequentially along this route</p>
        </div>
        {isDirty && (
          <button
            onClick={() => saveOrderMutation.mutate(localStops)}
            disabled={saveOrderMutation.isPending}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer"
          >
            {saveOrderMutation.isPending ? 'Saving...' : 'Save Sequence Order'}
          </button>
        )}
      </div>

      {/* Add Stop Dropdown */}
      <div className="flex flex-col sm:flex-row gap-2 my-5">
        <select
          value={selectedStopId}
          onChange={(e) => setSelectedStopId(e.target.value)}
          className="flex-1 rounded border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Select a stop to add...</option>
          {availableStops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.name} ({stop.code})
            </option>
          ))}
        </select>
        <button
          onClick={() => selectedStopId && addStopMutation.mutate(selectedStopId)}
          disabled={!selectedStopId || addStopMutation.isPending}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-40 transition cursor-pointer"
        >
          Add to End
        </button>
      </div>

      {/* Stop Sequence List */}
      {localStops.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No stops assigned to this route yet.</p>
      ) : (
        <ul className="divide-y divide-slate-700/80 border border-slate-700 rounded-md overflow-hidden">
          {localStops.map((stop, index) => (
            <li
              key={stop.routeStopId}
              className="flex items-center justify-between p-3.5 bg-slate-900/70 hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/80 rounded-full">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{stop.name}</p>
                  <p className="text-xs text-slate-400 font-mono">Code: {stop.code}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => moveItem(index, 'UP')}
                  disabled={index === 0}
                  className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-20 transition cursor-pointer"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(index, 'DOWN')}
                  disabled={index === localStops.length - 1}
                  className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-20 transition cursor-pointer"
                >
                  ▼
                </button>
                <button
                  onClick={() => removeStopMutation.mutate(stop.routeStopId)}
                  disabled={removeStopMutation.isPending}
                  className="ml-2 px-2 py-1 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}