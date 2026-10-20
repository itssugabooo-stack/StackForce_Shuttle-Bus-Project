const { io } = require("socket.io-client");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5003";
const ROUTE_ID = process.env.ROUTE_ID || "R01";
const VEHICLE_ID = process.env.VEHICLE_ID || "V_SIM_01";
const SIMULATOR_DURATION_MS = Number(process.env.SIMULATOR_DURATION_MS || 0);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

async function ensureRouteAndVehicle() {
  const routesResponse = await fetchJson(`${BACKEND_URL}/api/routes`);
  const routes = Array.isArray(routesResponse) ? routesResponse : routesResponse.data || [];

  const route = routes.find((item) => String(item.id) === String(ROUTE_ID)) || routes[0];
  if (!route) {
    throw new Error("No routes found in backend. Start the backend and seed the database first.");
  }

  const targetRouteId = String(route.id);

  try {
    await fetchJson(`${BACKEND_URL}/api/vehicles/${encodeURIComponent(VEHICLE_ID)}`);
    console.log(`Vehicle ${VEHICLE_ID} already exists.`);
    return targetRouteId;
  } catch (error) {
    await fetchJson(`${BACKEND_URL}/api/vehicles`, {
      method: "POST",
      body: JSON.stringify({
        id: VEHICLE_ID,
        name: "Simulated Shuttle",
        type: "bus",
        assignedRouteId: targetRouteId,
        status: "active",
      }),
    });

    console.log(`Created vehicle ${VEHICLE_ID} on route ${targetRouteId}.`);
    return targetRouteId;
  }
}

async function getRoutePoints(routeId) {
  const response = await fetchJson(`${BACKEND_URL}/api/route-stops?routeId=${encodeURIComponent(routeId)}`);
  const routeStops = Array.isArray(response) ? response : response.data || [];

  const points = routeStops
    .map((routeStop) => {
      const stop = routeStop?.stop ?? routeStop ?? {};
      const lat = Number(routeStop?.lat ?? routeStop?.latitude ?? stop?.lat ?? stop?.latitude ?? 0);
      const lng = Number(routeStop?.lng ?? routeStop?.longitude ?? stop?.lng ?? stop?.longitude ?? 0);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng];
    })
    .filter(Boolean)
    .sort((a, b) => (a[0] === b[0] ? 0 : a[0]));

  if (points.length > 1) {
    return points;
  }

  return [
    [14.0317, 100.6073],
    [14.0319, 100.6085],
    [14.0324, 100.6091],
    [14.0329, 100.6082],
    [14.0326, 100.6070],
    [14.0319, 100.6061],
  ];
}

(async () => {
  try {
    const routeId = await ensureRouteAndVehicle();
    const routePoints = await getRoutePoints(routeId);
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    socket.on("connect", () => {
      console.log(`Connected to backend: ${BACKEND_URL}`);
      socket.emit("join-route", routeId);

      let index = 0;
      const sendLocation = () => {
        const [lat, lng] = routePoints[index % routePoints.length];
        const payload = {
          vehicleId: VEHICLE_ID,
          routeId,
          lat,
          lng,
          speed: 18 + (index % 6) * 3,
          heading: 35 + (index % 8) * 20,
        };

        socket.emit("location:update", payload);
        console.log(`Sent: ${JSON.stringify(payload)}`);
        index += 1;
      };

      sendLocation();
      const timer = setInterval(sendLocation, 2500);

      if (SIMULATOR_DURATION_MS > 0) {
        setTimeout(() => {
          clearInterval(timer);
          socket.disconnect();
          process.exit(0);
        }, SIMULATOR_DURATION_MS);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Disconnected from backend: ${reason}`);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  } catch (error) {
    console.error("Simulator failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
