'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, Route } from '@/types/transport';
import { transportApi } from '@/services/apiClient';

interface VehicleRouteAssignerProps {
  vehicle: Vehicle;
  onClose: () => void;
  onAssign: (vehicleId: string, routeId: string | null, routeName?: string) => void;
}

export function VehicleRouteAssigner({ vehicle, onClose, onAssign }: VehicleRouteAssignerProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(vehicle.routeId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    transportApi.getRoutes()
      .then((data) => setRoutes(data))
      .catch((err) => console.warn('Could not fetch routes:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const vehicleId = vehicle.id || (vehicle as any)._id || (vehicle as any).sourceId;
    const targetRouteId = selectedRouteId.trim() === '' ? null : selectedRouteId;
    const selectedRouteObj = routes.find((r) => r.id === targetRouteId);

    if (!vehicleId) {
      setError('Vehicle ID is missing');
      setLoading(false);
      return;
    }

    try {
      await transportApi.assignRouteToVehicle(vehicleId, targetRouteId);
      onAssign(vehicleId, targetRouteId, selectedRouteObj?.name);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle route assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-xl p-6 text-white shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <div>
            <h2 className="text-base font-bold">Assign Vehicle to Route</h2>
            <p className="text-xs text-slate-400">
              {vehicle.plateNumber || (vehicle as any).sourceId || `Vehicle #${vehicle.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-0.5 rounded hover:bg-slate-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded text-xs bg-rose-950/80 text-rose-300 border border-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Select Transit Route</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- No Route (Unassigned) --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition cursor-pointer"
            >
              {loading ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VehicleRouteAssigner;