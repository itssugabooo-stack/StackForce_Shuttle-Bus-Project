import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import prisma from "./config/prisma";
import routeRoutes from "./routes/route.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import stopRoutes from "./routes/stop.routes";
import routeStopRoutes from "./routes/routeStop.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/route-stops", routeStopRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Shuttle Tracking Backend API is running",
  });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      database: "disconnected",
    });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const liveVehiclePositions = new Map<string, {
  id: string;
  routeId?: string | null;
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  updatedAt: string;
}>();

const toVehiclePayload = (vehicle: any, livePosition?: { latitude: number; longitude: number; speed?: number | null; heading?: number | null; updatedAt: string; routeId?: string | null }) => ({
  id: vehicle.id,
  name: vehicle.name,
  type: vehicle.type,
  routeId: vehicle.assignedRouteId ?? livePosition?.routeId ?? null,
  status: vehicle.status,
  latitude: typeof livePosition?.latitude === "number" ? livePosition.latitude : null,
  longitude: typeof livePosition?.longitude === "number" ? livePosition.longitude : null,
  speed: livePosition?.speed ?? null,
  heading: livePosition?.heading ?? null,
  updatedAt: livePosition?.updatedAt ?? new Date().toISOString(),
});

const emitVehicleSnapshot = async (routeId?: string) => {
  const vehicles = await prisma.vehicle.findMany({
    where: routeId ? { assignedRouteId: routeId } : {},
    orderBy: { createdAt: "desc" },
  });

  const payload = vehicles.map((vehicle) => {
    const live = liveVehiclePositions.get(vehicle.id);
    return toVehiclePayload(vehicle, live ?? undefined);
  });

  if (routeId) {
    io.to(routeId).emit("vehicles", payload);
    return;
  }

  io.emit("vehicles", payload);
};

io.on("connection", (socket) => {
  socket.on("join-route", async (routeId?: string) => {
    if (!routeId) return;
    socket.join(routeId);
    await emitVehicleSnapshot(routeId);
  });

  socket.on("request-vehicles", async (routeId?: string) => {
    await emitVehicleSnapshot(routeId);
  });

  socket.on("location:update", async (payload: any) => {
    const vehicleId = String(payload?.vehicleId ?? payload?.id ?? "");
    const rawRouteId = payload?.routeId ?? payload?.assignedRouteId ?? null;
    const latitude = Number(payload?.lat ?? payload?.latitude);
    const longitude = Number(payload?.lng ?? payload?.longitude);

    if (!vehicleId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return;
    }

    const routeId = vehicle.assignedRouteId ?? (typeof rawRouteId === "string" ? rawRouteId : null);
    const nextPosition = {
      id: vehicleId,
      routeId,
      latitude,
      longitude,
      speed: payload?.speed ?? null,
      heading: payload?.heading ?? null,
      updatedAt: new Date().toISOString(),
    };

    liveVehiclePositions.set(vehicleId, nextPosition);

    const eventPayload = {
      ...toVehiclePayload(vehicle, nextPosition),
      routeId,
    };

    if (routeId) {
      io.to(routeId).emit("vehicle:location", eventPayload);
      io.to(routeId).emit("vehicles", [eventPayload]);
      return;
    }

    io.emit("vehicle:location", eventPayload);
    io.emit("vehicles", [eventPayload]);
  });
});

const PORT = Number(process.env.PORT || 5003);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
