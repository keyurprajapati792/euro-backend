import express from "express";
import { SurveyController } from "../controllers/survey.controller.js";

const router = express.Router();

router.post("/", SurveyController.submitSurvey);
router.get("/", SurveyController.getAllSurveys);
router.get("/partner/:partnerId", SurveyController.getSurveyByPartner);
router.delete("/:id", SurveyController.deleteSurvey);

export default router;
