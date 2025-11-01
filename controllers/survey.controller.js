import { SurveyService } from "../services/servey.service.js";

export class SurveyController {
  // 🟩 Submit survey
  static async submitSurvey(req, res) {
    try {
      const surveyData = req.body;
      const result = await SurveyService.submitSurvey(surveyData);

      const msg =
        surveyData.state === "draft"
          ? "Survey saved as draft successfully"
          : "Survey submitted successfully";

      res.json({
        success: true,
        message: msg,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateSurvey(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await SurveyService.updateSurvey(id, data);

      res.json({
        success: true,
        message: "Survey updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 🟦 Get all surveys
  static async getAllSurveys(req, res) {
    try {
      const { partner_type, search, page, limit } = req.query;
      const result = await SurveyService.getAllSurveys({
        partner_type,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 🟨 Get surveys by partner ID
  static async getSurveyByEmployee(req, res) {
    try {
      const { type, empId, state, partnerId } = req.query;
      const survey = await SurveyService.getSurveyByEmployee({
        partnerType: type,
        empId,
        partnerId,
        state,
      });
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

  static async exportCSV(req, res) {
    try {
      const filter = { state: "submitted" };

      if (req.query.partner_type && req.query.partner_type !== "All") {
        filter.partnerType = req.query.partner_type;
      }

      const csv = await SurveyService.exportSurveysToCSV(filter);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=surveys.csv");
      res.status(200).send(csv);
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
