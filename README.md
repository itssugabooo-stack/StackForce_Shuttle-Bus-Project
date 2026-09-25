# RSU Shuttle Tracking System — Sprint 2 Backend & Integration Guide

This document serves as the backend integration manual and cross-team guide for the Sprint 2 deliverables. The backend is fully prepped to handle secure device authentication, trip lifecycle management, PostGIS route geometry, and a high-performance Socket.IO real-time engine.

Use the technical contracts and integration flows below to connect the Public Web, Admin Dashboard, Mobile Application, and Vehicle Simulator to the live backend system.

---

## 🔌 1. REST API Reference

### Authentication & Trips (Mobile App & Simulator)
*Protected endpoints require the `Authorization: Bearer <token>` header.*

| Method | Endpoint | Auth | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/vehicle/login` | None | `{ "sourceId": "...", "secret": "..." }` | Authenticates a vehicle tracking device and returns a JWT token. |
| **POST** | `/api/trips/start` | Device | `{ "routeId": "..." }` | Starts a new trip. Returns `409 Conflict` if the vehicle is already driving. |
| **POST** | `/api/trips/:id/end` | Device | *None* | Marks a specific trip status as `completed` and sets the `endTime`. |
| **GET** | `/api/trips/active` | Device | *None* | Checks if the requesting device currently has an `in_progress` trip. |
| **GET** | `/api/trips/live` | None | *None* | Returns a list of all vehicles across the system currently on an active trip. |

### Map Visualization (Public Web & Admin Dashboard)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/routes/:id/stops` | None | Returns the list of stops for a specific route, ordered by `stopOrder`. |
| **GET** | `/api/routes/:id/geometry` | None | Returns the GeoJSON coordinate array representing the drawn route line. |

---

## 📡 2. Socket.IO Real-Time Engine

The backend socket server runs on the same port as the REST API. 

**Connection & Authentication**
To connect, authenticated devices must pass their JWT token in the handshake payload. 
```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "YOUR_JWT_TOKEN" }
});
