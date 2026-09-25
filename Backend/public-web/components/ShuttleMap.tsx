"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Stop } from "../types";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    if (!stops.length) return;
    const bounds = L.latLngBounds(stops.map((stop) => [stop.latitude, stop.longitude]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, stops]);
  return null;
}

export default function ShuttleMap({ stops }: { stops: Stop[] }) {
  const center: [number, number] = stops.length
    ? [stops[0].latitude, stops[0].longitude]
    : [13.9634, 100.5853];

  return (
    <div className="map">
      <MapContainer center={center} zoom={15} scrollWheelZoom className="map">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds stops={stops} />
        {stops.map((stop, index) => (
          <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={icon}>
            <Popup>
              <strong>{stop.nameEn || stop.nameTh || stop.name || `Stop ${index + 1}`}</strong>
              <br />
              Stop {stop.stopOrder ?? stop.sequence ?? index + 1}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
