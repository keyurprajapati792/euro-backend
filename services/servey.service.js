import { Survey } from "../models/survey.js";

export class SurveyService {
  // 🟩 Submit a new survey
  static async submitSurvey(data) {
    const { partnerId, vertical, visitType, responses } = data;

    if (!partnerId || !vertical || !visitType || !responses) {
      throw new Error("All fields are required");
    }

    const newSurvey = await Survey.create({
      partnerId,
      vertical,
      visitType,
      responses,
    });

    return newSurvey;
  }

  // 🟦 Get all surveys
  static async getAllSurveys() {
    const surveys = await Survey.find().populate("partnerId");
    return surveys;
  }

  // 🟨 Get survey by partner ID
  static async getSurveyByPartner(partnerId) {
    const surveys = await Survey.find({ partnerId }).populate("partnerId");
    if (!surveys || surveys.length === 0) {
      throw new Error("No surveys found for this partner");
    }
    return surveys;
  }

  // 🟥 Delete a survey
  static async deleteSurvey(id) {
    const deleted = await Survey.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Survey not found");
    }
    return true;
  }
}
