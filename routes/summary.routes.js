import express from "express";
import { SummaryController } from "../controllers/summary.controller.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// Admin only dashboard stats route
router.get("/stats", authMiddleware(["admin"]), SummaryController.dashboard);

export default router;
