import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { routeId } = req.query;
    const routeStops = await prisma.routeStop.findMany({
      ...(routeId ? { where: { routeId: String(routeId) } } : {}),
      orderBy: { stopOrder: "asc" },
      include: { stop: true },
    });
    res.json(routeStops);
  } catch {
    res.status(500).json({ error: "Failed to get route stops" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const routeStop = await prisma.routeStop.findUnique({
      where: { id: req.params.id },
      include: { stop: true, route: true },
    });
    if (!routeStop) return res.status(404).json({ error: "RouteStop not found" });
    res.json(routeStop);
  } catch {
    res.status(500).json({ error: "Failed to get route stop" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { routeId, stopId, stopOrder } = req.body;
    if (!routeId || !stopId || stopOrder === undefined) {
      return res.status(400).json({ error: "routeId, stopId and stopOrder are required" });
    }
    if (!Number.isInteger(stopOrder) || stopOrder < 1) {
      return res.status(400).json({ error: "stopOrder must be a positive integer" });
    }

    const [route, stop] = await Promise.all([
      prisma.route.findUnique({ where: { id: routeId } }),
      prisma.stop.findUnique({ where: { id: stopId } }),
    ]);
    if (!route) return res.status(400).json({ error: "routeId does not reference an existing route" });
    if (!stop) return res.status(400).json({ error: "stopId does not reference an existing stop" });

    const routeStop = await prisma.routeStop.create({ data: { routeId, stopId, stopOrder } });
    res.status(201).json(routeStop);
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ error: "stopOrder already used for this route" });
    res.status(500).json({ error: "Failed to create route stop" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { stopId, stopOrder } = req.body;
    if (stopOrder !== undefined && (!Number.isInteger(stopOrder) || stopOrder < 1)) {
      return res.status(400).json({ error: "stopOrder must be a positive integer" });
    }
    if (stopId) {
      const stop = await prisma.stop.findUnique({ where: { id: stopId } });
      if (!stop) return res.status(400).json({ error: "stopId does not reference an existing stop" });
    }
    const routeStop = await prisma.routeStop.update({ where: { id: req.params.id }, data: { stopId, stopOrder } });
    res.json(routeStop);
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "RouteStop not found" });
    if (error.code === "P2002") return res.status(409).json({ error: "stopOrder already used for this route" });
    res.status(500).json({ error: "Failed to update route stop" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.routeStop.delete({ where: { id: req.params.id } });
    res.json({ message: "RouteStop deleted" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "RouteStop not found" });
    res.status(500).json({ error: "Failed to delete route stop" });
  }
});

export default router;