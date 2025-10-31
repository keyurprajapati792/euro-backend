import express from "express";
import { SurveyController } from "../controllers/survey.controller.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// Allow both admin & employee
const allowBoth = authMiddleware(["admin", "employee"]);

router.post("/", allowBoth, SurveyController.submitSurvey);
router.get("/", allowBoth, SurveyController.getAllSurveys);
router.get("/by-employee", allowBoth, SurveyController.getSurveyByEmployee);
router.delete("/:id", allowBoth, SurveyController.deleteSurvey);
router.get("/export", allowBoth, SurveyController.exportCSV);

export default router;
