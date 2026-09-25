"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Stop, Vehicle } from "../types";

const RSU_CAMPUS_CENTER: [number, number] = [14.0311, 100.6068];
const RSU_CAMPUS_BOUNDS = L.latLngBounds([
  [14.0284, 100.6022],
  [14.0355, 100.6115],
]);

const stopIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length === 0) {
      map.setView(RSU_CAMPUS_CENTER, 15);
      return;
    }

    const bounds = L.latLngBounds(stops.map((stop) => [stop.latitude, stop.longitude]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, stops]);
  return null;
}

export default function ShuttleMap({ stops, vehicles = [] }: { stops: Stop[]; vehicles?: Vehicle[] }) {
  const safeStops = stops.filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude));
  const center: [number, number] = safeStops.length ? [safeStops[0].latitude, safeStops[0].longitude] : RSU_CAMPUS_CENTER;

  const routePath = safeStops.map((stop) => [stop.latitude, stop.longitude] as [number, number]);

  return (
    <div className="map-shell">
      <MapContainer center={center} zoom={15} scrollWheelZoom className="map-leaflet">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds stops={safeStops} />

        {routePath.length > 1 && (
          <Polyline positions={routePath} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.9 }} />
        )}

        {safeStops.map((stop, index) => (
          <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={stopIcon}>
            <Popup>
              <strong>{stop.nameEn || stop.nameTh || stop.name || `Stop ${index + 1}`}</strong>
              <br />
              Stop {stop.stopOrder ?? stop.sequence ?? index + 1}
            </Popup>
          </Marker>
        ))}

        {vehicles
          .filter((vehicle) => typeof vehicle.latitude === "number" && typeof vehicle.longitude === "number")
          .map((vehicle) => (
            <CircleMarker
              key={vehicle.id}
              center={[Number(vehicle.latitude), Number(vehicle.longitude)]}
              radius={9}
              pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.9 }}
            >
              <Popup>
                <strong>{vehicle.name ?? `Vehicle ${vehicle.id}`}</strong>
                <br />
                {vehicle.type ?? "bus"}
                <br />
                Route {vehicle.routeId ?? "—"}
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
}
