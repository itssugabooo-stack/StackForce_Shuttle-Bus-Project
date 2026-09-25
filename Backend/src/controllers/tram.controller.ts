import { Request, Response } from "express";
import prisma from "../config/prisma";

// CREATE tram
export const createTram = async (req: Request, res: Response) => {
  try {
    const { tramCode, name, status } = req.body;

    const tram = await prisma.tram.create({
      data: {
        tramCode,
        name,
        status,
      },
    });

    res.status(201).json(tram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create tram" });
  }
};

// READ all trams
export const getTrams = async (_req: Request, res: Response) => {
  try {
    const trams = await prisma.tram.findMany();

    res.json(trams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get trams" });
  }
};

// READ one tram
export const getTramById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const tram = await prisma.tram.findUnique({
      where: { id },
    });

    if (!tram) {
      return res.status(404).json({ error: "Tram not found" });
    }

    res.json(tram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get tram" });
  }
};

// UPDATE tram
export const updateTram = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { tramCode, name, status } = req.body;

    const tram = await prisma.tram.update({
      where: { id },
      data: {
        tramCode,
        name,
        status,
      },
    });

    res.json(tram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update tram" });
  }
};

// DELETE tram
export const deleteTram = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.tram.delete({
      where: { id },
    });

    res.json({
      message: "Tram deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete tram" });
  }
};
