import Partner from "../models/partner.js";
import { Survey } from "../models/survey.js";
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
      const filter = {};

      if (req.query.partner_type && req.query.partner_type !== "All") {
        filter.partnerType = req.query.partner_type;
      }

      // Add search support
      const search = req.query.search;
      let surveysQuery = Survey.find(filter).populate("partnerId");

      if (search) {
        // Use case-insensitive regex search on partner fields
        const partners = await Partner.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { contactPerson: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }).select("_id");

        const partnerIds = partners.map((p) => p._id);
        surveysQuery = surveysQuery.find({ partnerId: { $in: partnerIds } });
      }

      const surveys = await surveysQuery;
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
