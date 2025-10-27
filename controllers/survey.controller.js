import { SurveyService } from "../services/servey.service.js";

export class SurveyController {
  // 🟩 Submit survey
  static async submitSurvey(req, res) {
    try {
      const surveyData = req.body;
      const result = await SurveyService.submitSurvey(surveyData);
      res.json({
        success: true,
        message: "Survey submitted successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 🟦 Get all surveys
  static async getAllSurveys(req, res) {
    try {
      const surveys = await SurveyService.getAllSurveys();
      res.json({ success: true, data: surveys });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 🟨 Get surveys by partner ID
  static async getSurveyByPartner(req, res) {
    try {
      const { partnerId } = req.params;
      const survey = await SurveyService.getSurveyByPartner(partnerId);
      res.json({ success: true, data: survey });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 🟥 Delete survey
  static async deleteSurvey(req, res) {
    try {
      const { id } = req.params;
      await SurveyService.deleteSurvey(id);
      res.json({ success: true, message: "Survey deleted successfully" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
