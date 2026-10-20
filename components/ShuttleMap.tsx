"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Stop, Vehicle } from "../types";

const RSU_CAMPUS_CENTER: [number, number] = [14.0311, 100.6068];

const stopIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function createVehicleIcon(vehicle: Vehicle) {
  const heading = typeof vehicle.heading === "number" ? vehicle.heading : 0;
  const color = vehicle.routeId ? "#0f172a" : "#f97316";

  return L.divIcon({
    className: "bus-marker-icon",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: linear-gradient(135deg, #facc15 0%, #f97316 100%);
        border: 2px solid ${color};
        box-shadow: 0 4px 12px rgba(15,23,42,0.28);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transform: rotate(${heading}deg);
        transform-origin: center center;
        user-select: none;
      ">🚌</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ stops, routeGeometry }: { stops: Stop[]; routeGeometry?: [number, number][] | null }) {
  const map = useMap();

  useEffect(() => {
    if (routeGeometry && routeGeometry.length > 1) {
      map.fitBounds(L.latLngBounds(routeGeometry), {
        padding: [40, 40],
        maxZoom: 14,
      });
      return;
    }

    if (stops.length === 0) {
      map.setView(RSU_CAMPUS_CENTER, 14);
      return;
    }

    const bounds = L.latLngBounds(stops.map((stop) => [stop.latitude, stop.longitude]));
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14,
    });
  }, [map, routeGeometry, stops]);

  return null;
}

function normalizeRouteGeometry(geometry?: [number, number][] | null): [number, number][] {
  if (!Array.isArray(geometry) || geometry.length === 0) {
    return [];
  }

  return geometry.map(([lat, lng]) => [Number(lat), Number(lng)] as [number, number]);
}

export default function ShuttleMap({
  stops,
  vehicles = [],
  routeColor = "#4f46e5",
  routeGeometry = null,
}: {
  stops: Stop[];
  vehicles?: Vehicle[];
  routeColor?: string;
  routeGeometry?: [number, number][] | null;
}) {
  const safeStops = stops.filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude));
  const center: [number, number] = safeStops.length ? [safeStops[0].latitude, safeStops[0].longitude] : RSU_CAMPUS_CENTER;

  const routePath = safeStops.map((stop) => [stop.latitude, stop.longitude] as [number, number]);
  const normalizedGeometry = normalizeRouteGeometry(routeGeometry);
  const polylinePositions =
    normalizedGeometry.length > 1
      ? normalizedGeometry
      : routePath.length > 1
        ? routePath
        : [];

  return (
    <div className="map-shell">
      <MapContainer key={safeStops.length > 0 ? `route-${safeStops[0].id}` : "default-map"} center={center} zoom={15} scrollWheelZoom className="map-leaflet">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />
        <FitBounds stops={safeStops} routeGeometry={routeGeometry ?? (polylinePositions.length > 1 ? polylinePositions : null)} />

        {polylinePositions.length > 1 && (
          <Polyline positions={polylinePositions} pathOptions={{ color: routeColor, weight: 5, opacity: 0.9, lineCap: "round" }} />
        )}

        {safeStops.map((stop, index) => (
          <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={stopIcon}>
            <Popup>
              <strong>{stop.nameEn || stop.nameTh || stop.name || `Stop ${index + 1}`}</strong>
              <br />
              {stop.nameTh && stop.nameEn ? stop.nameTh : "Route stop"}
              <br />
              Stop {stop.stopOrder ?? stop.sequence ?? index + 1}
            </Popup>
          </Marker>
        ))}

        {vehicles
          .filter((vehicle) => typeof vehicle.latitude === "number" && typeof vehicle.longitude === "number")
          .map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={[Number(vehicle.latitude), Number(vehicle.longitude)]}
              icon={createVehicleIcon(vehicle)}
            >
              <Popup>
                <strong>{vehicle.name ?? `Vehicle ${vehicle.id}`}</strong>
                <br />
                {vehicle.type ?? "bus"}
                <br />
                Route {vehicle.routeId ?? "—"}
                {typeof vehicle.speed === "number" && <><br />Speed: {vehicle.speed} km/h</>}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
