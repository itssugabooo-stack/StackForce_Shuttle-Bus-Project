"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { io } from "socket.io-client";
import { getRoutes, getRouteGeometry, getStops, getVehicles } from "../lib/api";
import type { Route, Stop, Vehicle } from "../types";

const ShuttleMap = dynamic(() => import("../components/ShuttleMap"), { ssr: false });

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5003";

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
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

    socket.on(
      "vehicle:location",
      (payload: Partial<Vehicle> & { routeId?: string | null; updatedAt?: string; speed?: number | null; heading?: number | null }) => {
        if (!payload || typeof payload.id === "undefined") return;

        setVehicles((prev) => {
          const nextVehicle = {
            id: String(payload.id),
            name: payload.name ?? "Vehicle",
            type: payload.type ?? "bus",
            routeId: payload.routeId ?? null,
            status: payload.status ?? "active",
            latitude: typeof payload.latitude === "number" ? payload.latitude : null,
            longitude: typeof payload.longitude === "number" ? payload.longitude : null,
            heading: typeof payload.heading === "number" ? payload.heading : null,
            speed: typeof payload.speed === "number" ? payload.speed : null,
            updatedAt: payload.updatedAt ?? null,
          };

          const existingIndex = prev.findIndex((vehicle) => String(vehicle.id) === String(payload.id));
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = nextVehicle;
            return updated;
          }

          return [...prev, nextVehicle];
        });
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [selectedRouteId]);

  useEffect(() => {
    if (!selectedRouteId) {
      setStops([]);
      setRouteGeometry(null);
      return;
    }

    setLoadingStops(true);
    setError("");

    Promise.all([getStops(selectedRouteId), getRouteGeometry(selectedRouteId)])
      .then(([nextStops, nextGeometry]) => {
        setStops(nextStops);
        setRouteGeometry(nextGeometry);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load route details."))
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

  const activeVehicles = filteredVehicles.filter((vehicle) => vehicle.latitude && vehicle.longitude).length;

  return (
    <main className="page-shell">
      <header className="hero-bar">
        <div className="brand-block">
          <div className="brand-mark">RSU</div>
          <div>
            <p className="eyebrow">Public Web</p>
            <h1>Shuttle Tracker</h1>
          </div>
        </div>

        <div className="status-row">
          <span className="status-pill live">Live tracking</span>
          <span className="status-pill subtle">{routes.length} routes</span>
          <a
            href="http://localhost:8001/vehicle-simulator.html"
            target="_blank"
            rel="noreferrer"
            className="status-pill simulator-link"
          >
            Vehicle Simulator
          </a>
        </div>
      </header>

      <section className="hero-panel card">
        <div className="hero-copy">
          <p className="eyebrow">Rangsit University</p>
          <h2>Route overview and live campus movement</h2>
          <p className="subtitle">Track stops, view route paths, and monitor shuttle positions in real time.</p>
        </div>

        <div className="control-panel">
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
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}

      <section className="info-row">
        <article className="metric-card card">
          <p className="eyebrow">Selected route</p>
          <h3>{selectedRoute?.name || selectedRoute?.routeCode || "—"}</h3>
          <div className="metric-meta">
            {selectedRoute?.routeCode && (
              <span
                className="route-badge"
                style={{
                  background: selectedRoute.color ? `${selectedRoute.color}18` : undefined,
                  borderColor: selectedRoute.color ?? undefined,
                  color: selectedRoute.color ?? undefined,
                }}
              >
                {selectedRoute.routeCode}
              </span>
            )}
            {selectedRoute?.active !== false && <span className="online-dot">Active</span>}
          </div>
        </article>

        <article className="metric-card card">
          <p className="eyebrow">Stops</p>
          <h3>{stops.length}</h3>
          <small>Ordered along the route</small>
        </article>

        <article className="metric-card card">
          <p className="eyebrow">Vehicles</p>
          <h3>{activeVehicles}</h3>
          <small>Currently reporting location</small>
        </article>
      </section>

      <section className="layout-grid">
        <aside className="left-panel">
          <article className="card info-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Route details</p>
                <h2>{selectedRoute?.name || selectedRoute?.routeCode || "No route selected"}</h2>
              </div>
            </div>
            <p className="muted">
              {selectedRoute
                ? "Stops are displayed in the backend order for the selected route."
                : "Choose a route to load its stops and live vehicle context."}
            </p>
          </article>

          <article className="card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Vehicles</p>
                <h2>{filteredVehicles.length} active</h2>
              </div>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="empty">No vehicles are reporting for this route.</div>
            ) : (
              <ul className="vehicle-list">
                {filteredVehicles.map((vehicle) => (
                  <li key={vehicle.id} className="vehicle-item">
                    <div className="vehicle-header">
                      <span className="vehicle-bus">🚌</span>
                      <div>
                        <strong>{vehicle.name || `Vehicle ${vehicle.id}`}</strong>
                        <span className="vehicle-id">#{vehicle.id}</span>
                      </div>
                    </div>

                    <div className="vehicle-meta">
                      <span className="vehicle-status">{vehicle.status ?? "active"}</span>
                      {vehicle.routeId && <span className="route-badge">{vehicle.routeId}</span>}
                    </div>

                    <div className="vehicle-details">
                      <span>Speed: {vehicle.speed != null ? `${vehicle.speed} km/h` : "—"}</span>
                      <span>Heading: {vehicle.heading != null ? `${vehicle.heading}°` : "—"}</span>
                      <span>
                        Location: {vehicle.latitude != null && vehicle.longitude != null
                          ? `${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}`
                          : "—"}
                      </span>
                      <span>Updated: {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleTimeString() : "—"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Stop list</p>
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
        </aside>

        <article className="card map-card">
          <div className="section-heading map-header">
            <div>
              <p className="eyebrow">Map view</p>
              <h2>{selectedRoute?.name ? `${selectedRoute.name} route` : "Route map"}</h2>
            </div>
            <span className="legend-dot" style={{ background: selectedRoute?.color ?? "#4f46e5" }} />
          </div>
          {selectedRouteId && (
            <ShuttleMap
              key={selectedRouteId}
              stops={stops}
              vehicles={filteredVehicles}
              routeColor={selectedRoute?.color ?? "#4f46e5"}
              routeGeometry={routeGeometry}
            />
          )}
        </article>
      </section>
    </main>
  );
}
