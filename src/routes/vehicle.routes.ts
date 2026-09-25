import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    res.json(await prisma.vehicle.findMany());
  } catch {
    res.status(500).json({ error: "Failed to get vehicles" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch {
    res.status(500).json({ error: "Failed to get vehicle" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, name, type, assignedRouteId, status } = req.body;
    if (!id || !name || !type) {
      return res.status(400).json({ error: "id, name and type are required" });
    }
    const vehicle = await prisma.vehicle.create({
      data: { id, name, type, assignedRouteId, status: status || "inactive" },
    });
    res.status(201).json(vehicle);
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ error: "Vehicle id already exists" });
    if (error.code === "P2003") return res.status(400).json({ error: "assignedRouteId does not reference an existing route" });
    res.status(500).json({ error: "Failed to create vehicle" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, type, assignedRouteId, status } = req.body;
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: { name, type, assignedRouteId, status },
    });
    res.json(vehicle);
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Vehicle not found" });
    if (error.code === "P2003") return res.status(400).json({ error: "assignedRouteId does not reference an existing route" });
    res.status(500).json({ error: "Failed to update vehicle" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ message: "Vehicle deleted" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Vehicle not found" });
    res.status(500).json({ error: "Failed to delete vehicle" });
  }
});

export default router;