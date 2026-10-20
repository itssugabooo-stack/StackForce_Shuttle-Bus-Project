import { Request, Response } from "express";

// Legacy tram controller kept as a safe no-op because the current schema no longer includes a `tram` model.
export const createTram = async (_req: Request, res: Response) => {
  res.status(410).json({ error: "Tram endpoints are unavailable in the current backend schema." });
};

export const getTrams = async (_req: Request, res: Response) => {
  res.status(410).json({ error: "Tram endpoints are unavailable in the current backend schema." });
};

export const getTramById = async (_req: Request, res: Response) => {
  res.status(410).json({ error: "Tram endpoints are unavailable in the current backend schema." });
};

export const updateTram = async (_req: Request, res: Response) => {
  res.status(410).json({ error: "Tram endpoints are unavailable in the current backend schema." });
};

export const deleteTram = async (_req: Request, res: Response) => {
  res.status(410).json({ error: "Tram endpoints are unavailable in the current backend schema." });
};
