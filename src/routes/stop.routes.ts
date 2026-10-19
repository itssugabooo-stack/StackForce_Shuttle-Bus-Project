import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

function isValidLatLng(lat: any, lng: any) {
  return typeof lat === "number" && typeof lng === "number" &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

router.get("/", async (_req, res) => {
  try {
    const stops = await prisma.$queryRaw`
      SELECT id, name_th AS "nameTh", name_en AS "nameEn",
             ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng,
             image_url AS "imageUrl", status, created_at AS "createdAt"
      FROM stops
    `;
    res.json(stops);
  } catch {
    res.status(500).json({ error: "Failed to get stops" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rows: any[] = await prisma.$queryRaw`
      SELECT id, name_th AS "nameTh", name_en AS "nameEn",
             ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng,
             image_url AS "imageUrl", status, created_at AS "createdAt"
      FROM stops WHERE id = ${req.params.id}
    `;
    if (rows.length === 0) return res.status(404).json({ error: "Stop not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to get stop" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, nameTh, nameEn, lat, lng, imageUrl, status } = req.body;
    if (!id || !nameTh || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "id, nameTh, lat and lng are required" });
    }
    if (!isValidLatLng(lat, lng)) {
      return res.status(400).json({ error: "lat must be -90..90, lng must be -180..180" });
    }
    const existing = await prisma.stop.findUnique({ where: { id } });
    if (existing) return res.status(409).json({ error: "Stop id already exists" });

    await prisma.$executeRaw`
      INSERT INTO stops (id, name_th, name_en, location, image_url, status)
      VALUES (${id}, ${nameTh}, ${nameEn ?? null},
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${imageUrl ?? null}, ${status || "active"})
    `;
    res.status(201).json({ id, nameTh, nameEn, lat, lng, imageUrl, status: status || "active" });
  } catch {
    res.status(500).json({ error: "Failed to create stop" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nameTh, nameEn, lat, lng, imageUrl, status } = req.body;
    const existing = await prisma.stop.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Stop not found" });

    if ((lat !== undefined || lng !== undefined) && !isValidLatLng(lat, lng)) {
      return res.status(400).json({ error: "lat must be -90..90, lng must be -180..180" });
    }

    if (lat !== undefined && lng !== undefined) {
      await prisma.$executeRaw`
        UPDATE stops SET name_th = COALESCE(${nameTh}, name_th),
          name_en = COALESCE(${nameEn}, name_en),
          location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          image_url = COALESCE(${imageUrl}, image_url),
          status = COALESCE(${status}, status)
        WHERE id = ${req.params.id}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE stops SET name_th = COALESCE(${nameTh}, name_th),
          name_en = COALESCE(${nameEn}, name_en),
          image_url = COALESCE(${imageUrl}, image_url),
          status = COALESCE(${status}, status)
        WHERE id = ${req.params.id}
      `;
    }
    res.json({ message: "Stop updated" });
  } catch {
    res.status(500).json({ error: "Failed to update stop" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.stop.delete({ where: { id: req.params.id } });
    res.json({ message: "Stop deleted" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Stop not found" });
    if (error.code === "P2003") return res.status(409).json({ error: "Stop is still used by a route and cannot be deleted" });
    res.status(500).json({ error: "Failed to delete stop" });
  }
});

export default router;