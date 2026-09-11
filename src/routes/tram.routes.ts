import { Router } from "express";
import {
  createTram,
  getTrams,
  getTramById,
  updateTram,
  deleteTram,
} from "../controllers/tram.controller";

const router = Router();

router.post("/", createTram);
router.get("/", getTrams);
router.get("/:id", getTramById);
router.put("/:id", updateTram);
router.delete("/:id", deleteTram);

export default router;
