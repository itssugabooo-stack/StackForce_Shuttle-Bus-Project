"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getRoutes, getStops } from "../lib/api";
import type { Route, Stop } from "../types";

const ShuttleMap = dynamic(() => import("../components/ShuttleMap"), { ssr: false });

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadedRouteStops, setLoadedRouteStops] = useState<{ routeId: string; stops: Stop[] } | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [error, setError] = useState<{ routeId: string | null; message: string } | null>(null);

  const stops = loadedRouteStops?.routeId === selectedRouteId ? loadedRouteStops.stops : [];
  const currentError = error?.routeId === null || error?.routeId === selectedRouteId
    ? error.message
    : "";
  const loadingStops = Boolean(
    selectedRouteId && loadedRouteStops?.routeId !== selectedRouteId && !currentError
  );

  useEffect(() => {
    getRoutes()
      .then((data) => {
        setRoutes(data);
        if (data.length) setSelectedRouteId(String(data[0].id));
      })
      .catch((e: unknown) => setError({
        routeId: null,
        message: e instanceof Error ? e.message : "Unable to load routes.",
      }))
      .finally(() => setLoadingRoutes(false));
  }, []);

  useEffect(() => {
    if (!selectedRouteId) return;

    let isCurrent = true;
    getStops(selectedRouteId)
      .then((data) => {
        if (!isCurrent) return;
        setLoadedRouteStops({ routeId: selectedRouteId, stops: data });
        setError((current) => current?.routeId === selectedRouteId ? null : current);
      })
      .catch((e: unknown) => {
        if (!isCurrent) return;
        setError({
          routeId: selectedRouteId,
          message: e instanceof Error ? e.message : "Unable to load stops.",
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedRouteId]);

  const selectedRoute = useMemo(
    () => routes.find((route) => String(route.id) === selectedRouteId),
    [routes, selectedRouteId]
  );

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Rangsit University</p>
          <h1>Shuttle Tracker</h1>
          <p className="subtitle">Routes, stops, and basic shuttle information.</p>
        </div>
        <div className="status-pill">Public Web · Sprint 1</div>
      </header>

      <section className="controls card">
        <label htmlFor="route">Select route</label>
        <select
          id="route"
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          disabled={loadingRoutes || routes.length === 0}
        >
          {loadingRoutes && <option>Loading routes…</option>}
          {!loadingRoutes && routes.length === 0 && <option>No routes available</option>}
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name ? `${route.routeCode} — ${route.name}` : route.routeCode}
            </option>
          ))}
        </select>
      </section>

      {currentError && <div className="alert error">{currentError}</div>}

      <section className="grid">
        <div className="left-column">
          <article className="card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selected route</p>
                <h2>{selectedRoute?.name || selectedRoute?.routeCode || "—"}</h2>
              </div>
              {selectedRoute?.routeCode && <span className="badge">{selectedRoute.routeCode}</span>}
            </div>
            <p className="muted">
              {selectedRoute ? "Stops are displayed in their backend-provided order." : "Choose a route to begin."}
            </p>
          </article>

          <article className="card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Route stops</p>
                <h2>{stops.length} stops</h2>
              </div>
              {loadingStops && <span className="muted">Loading…</span>}
            </div>

            {!loadingStops && stops.length === 0 ? (
              <div className="empty">No stops are available for this route.</div>
            ) : (
              <ol className="stop-list">
                {stops.map((stop, index) => (
                  <li key={stop.id} className="stop-item">
                    <span className="stop-number">{stop.sequence ?? stop.stopOrder ?? index + 1}</span>
                    <div>
                      <strong>{stop.nameEn || stop.nameTh || stop.name || `Stop ${index + 1}`}</strong>
                      {stop.nameTh && stop.nameEn && <span className="thai-name">{stop.nameTh}</span>}
                      <span className="coordinates">{stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </div>

        <article className="card map-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Map</p>
              <h2>Stops on route</h2>
            </div>
          </div>
          <ShuttleMap stops={stops} />
        </article>
      </section>
    </main>
  );
}
