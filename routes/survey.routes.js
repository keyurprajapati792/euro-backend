import express from "express";
import { SurveyController } from "../controllers/survey.controller.js";

const router = express.Router();

router.post("/", SurveyController.submitSurvey);
router.get("/", SurveyController.getAllSurveys);
router.get("/by-employee", SurveyController.getSurveyByEmployee);
router.delete("/:id", SurveyController.deleteSurvey);
router.get("/export", SurveyController.exportCSV);

export default router;
