# RSU Shuttle Tracking System — Sprint 2 Backend & Integration Guide

This document serves as the backend integration manual and cross-team guide for the Sprint 2 deliverables. The backend is fully prepped to handle secure device authentication, trip lifecycle management, PostGIS route geometry, and a high-performance Socket.IO real-time engine.

---

## 🚀 1. Local Setup & Installation

Follow these steps to get the backend running on your local machine.

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL database with the **PostGIS** extension installed and enabled.

### Step 1: Environment Configuration
Create a `.env` file in the root of the backend directory (where `package.json` is located). Add the following keys, ensuring each is on its own line:
```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/shuttle_tracking"
PORT=5000
JWT_SECRET="your-secure-random-jwt-secret"

```

### Step 2: Install Dependencies

```bash
npm install

```

### Step 3: Database Setup & Seeding

Apply the database schema migrations (which includes the PostGIS `geometry` column) and populate the database with required default data (Routes, Stops, Vehicles, and Test Credentials).

```bash
npx prisma migrate dev
npx prisma db seed

```

*Note: The seed script provides a test vehicle device (sourceId: `TS01`, secret: `device123`) and an admin user (username: `admin`, password: `admin123`).*

### Step 4: Start the Server

```bash
npm run dev

```

The server (REST API and Socket.IO) will start on `http://localhost:5000`.

---

## 🔌 2. REST API Reference

### Authentication & Trips (Mobile App & Simulator)

*Protected endpoints require the `Authorization: Bearer <token>` header.*

| Method | Endpoint | Auth | Body Payload | Description |
| --- | --- | --- | --- | --- |
| **POST** | `/api/auth/vehicle/login` | None | `{ "sourceId": "...", "secret": "..." }` | Authenticates a vehicle tracking device and returns a JWT token. |
| **POST** | `/api/trips/start` | Device | `{ "routeId": "..." }` | Starts a new trip. Returns `409 Conflict` if the vehicle is already driving. |
| **POST** | `/api/trips/:id/end` | Device | *None* | Marks a specific trip status as `completed` and sets the `endTime`. |
| **GET** | `/api/trips/active` | Device | *None* | Checks if the requesting device currently has an `in_progress` trip. |
| **GET** | `/api/trips/live` | None | *None* | Returns a list of all vehicles across the system currently on an active trip. |

### Map Visualization (Public Web & Admin Dashboard)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| **GET** | `/api/routes/:id/stops` | None | Returns the list of stops for a specific route, ordered by `stopOrder`. |
| **GET** | `/api/routes/:id/geometry` | None | Returns the GeoJSON coordinate array representing the drawn route line. |

---

## 📡 3. Socket.IO Real-Time Engine

The backend socket server runs on the same port as the REST API.

**Connection & Authentication**
To connect, authenticated devices must pass their JWT token in the handshake payload.

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "YOUR_JWT_TOKEN" }
});

```

**Emitting Data (Simulator & Mobile App)**
Authenticated devices ping this event to update their location.

* **Event:** `location:update`
* **Payload:** `{ "lat": 13.9644, "lng": 100.5871, "speed": 45, "heading": 90 }`

**Listening for Data (Public Web & Admin Dashboard)**
Clients listen to this broadcast to update vehicle markers on the map in real-time.

* **Event:** `vehicle:location`
* **Payload Received:** `{ "vehicleId": "V01", "lat": 13.9644, "lng": 100.5871, "speed": 45, "heading": 90, "updatedAt": "2026-09-26T..." }`

---

## 🎯 4. Team Integration Requirements

### 🌐 Public Web

**Expected Functionality:**

1. Load Routes and Stops from the Backend (`GET /api/routes/:id/stops`).
2. Allow users to select a Route.
3. Display Stops in the correct `stopOrder`.
4. Display Stops on the map.
5. Draw the selected Route path.
6. Connect to the Backend using Socket.IO.
7. Receive realtime Vehicle location updates (`vehicle:location`).
8. Display and update Vehicle markers on the map.

### 🎛️ Admin Dashboard

**Expected Functionality:**

1. Display Routes and Vehicles on the map.
2. Draw Route paths on the map.
3. Connect to the Backend using Socket.IO.
4. Receive realtime Vehicle location updates (`vehicle:location`).
5. Display and update Vehicle markers.
6. Prepare basic Vehicle / Active Trip status UI (utilizing `GET /api/trips/live`).

### 📱 Mobile Application

**Expected Functionality:**

1. Start the actual Tram Tracking Mobile application.
2. Setup project structure and navigation.
3. Connect to the Backend API.
4. Load Vehicle and Route information.
5. Prepare authentication (`POST /api/auth/vehicle/login`).
6. Prepare the Start Trip / End Trip flow (`POST /api/trips/start` & `/end`).
7. Prepare GPS permission and location handling (emitting `location:update`).

### 🚗 Vehicle Simulator

The Simulator is used to test realtime functionality without waiting for the real Mobile GPS.
**Expected Flow:**
`Simulator` ➔ `Backend` ➔ `Socket.IO` ➔ `Public Web + Admin Dashboard`

* Create a simple Simulator that can authenticate and send test Vehicle locations (`location:update`) to the Backend on an interval.

---

## 🗺️ 5. Route Visualization Flow

The system must handle map drawings through the following pipeline:

1. Provide Route Geometry for each Route via the Backend database (PostGIS).
2. Frontend loads the selected Route Geometry (`GET /api/routes/:id/geometry`).
3. Draw the Route as a line on the map.
4. Display Stops together with the Route.

**Visualization Pipeline:**
`Route` ➔ `Route Geometry` ➔ `Map` ➔ `Route Line + Stops`

---

## 🏁 6. Sprint 2 Expected Result

By the end of Sprint 2, the team must be able to demonstrate this complete end-to-end flow:

1. **Select Route**
↓
2. **Display Route + Stops**
↓
3. **Simulator sends Vehicle Location**
↓
4. **Backend broadcasts via Socket.IO**
↓
5. **Public Web + Admin Dashboard**
↓
6. **Vehicle Marker updates in Realtime**

```

```
