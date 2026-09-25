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

const emitVehicleSnapshot = async (routeId?: string) => {
  const vehicles = await prisma.vehicle.findMany({
    where: routeId ? { assignedRouteId: routeId } : {},
    orderBy: { createdAt: "desc" },
  });

  const payload = vehicles.map((vehicle) => ({
    id: vehicle.id,
    name: vehicle.name,
    type: vehicle.type,
    routeId: vehicle.assignedRouteId,
    status: vehicle.status,
    latitude: null,
    longitude: null,
  }));

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
});

const PORT = Number(process.env.PORT || 5001);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
