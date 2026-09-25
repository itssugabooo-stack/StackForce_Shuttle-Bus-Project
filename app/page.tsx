"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { io } from "socket.io-client";
import { getRoutes, getStops, getVehicles } from "../lib/api";
import type { Route, Stop, Vehicle } from "../types";

const ShuttleMap = dynamic(() => import("../components/ShuttleMap"), { ssr: false });

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingStops, setLoadingStops] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getRoutes()
      .then((data) => {
        setRoutes(data);
        if (data.length) setSelectedRouteId(String(data[0].id));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load routes."))
      .finally(() => setLoadingRoutes(false));
  }, []);

  useEffect(() => {
    getVehicles()
      .then(setVehicles)
      .catch((e) => setError((prev) => prev || (e instanceof Error ? e.message : "Unable to load vehicles.")));
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      if (selectedRouteId) socket.emit("join-route", selectedRouteId);
    });

    socket.on("vehicles", (payload: Vehicle[]) => {
      setVehicles(Array.isArray(payload) ? payload : []);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedRouteId]);

  useEffect(() => {
    if (!selectedRouteId) {
      setStops([]);
      return;
    }
    setLoadingStops(true);
    setError("");
    getStops(selectedRouteId)
      .then(setStops)
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load stops."))
      .finally(() => setLoadingStops(false));
  }, [selectedRouteId]);

  const selectedRoute = useMemo(
    () => routes.find((route) => String(route.id) === selectedRouteId),
    [routes, selectedRouteId]
  );

  const filteredVehicles = useMemo(
    () => vehicles.filter((vehicle) => !selectedRouteId || !vehicle.routeId || String(vehicle.routeId) === selectedRouteId),
    [selectedRouteId, vehicles]
  );

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Rangsit University</p>
          <h1>Shuttle Tracker</h1>
          <p className="subtitle">Routes, stops, and live vehicle updates.</p>
        </div>
        <div className="status-pill">Public Web · Sprint 2</div>
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

      {error && <div className="alert error">{error}</div>}

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
              <h2>{selectedRoute?.name ? `Route ${selectedRoute.name}` : "Stops on route"}</h2>
            </div>
          </div>
          <ShuttleMap stops={stops} vehicles={filteredVehicles} />
        </article>
      </section>
    </main>
  );
}
