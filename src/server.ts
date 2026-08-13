import express from "express";
import cors from "cors";
import prisma from "./config/prisma";
import tramRoutes from "./routes/tram.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/trams", tramRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
