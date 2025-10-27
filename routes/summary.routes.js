import express from "express";
import { SummaryController } from "../controllers/summary.controller.js";

const router = express.Router();

// Protected route example
router.get("/stats", SummaryController.dashboard);

export default router;
