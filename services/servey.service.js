import { Survey } from "../models/survey.js";

export class SurveyService {
  // 🟩 Submit a new survey
  static async submitSurvey(data) {
    const { partnerId, partnerType, visitType, responses } = data;

    if (!partnerId || !partnerType || !visitType || !responses) {
      throw new Error("All fields are required");
    }

    const updatedSurvey = await Survey.findOneAndUpdate(
      { partnerId, partnerType, visitType },
      {
        $set: { responses },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return updatedSurvey;
  }

  // 🟦 Get all surveys
  static async getAllSurveys(filter = {}) {
    const surveys = await Survey.find(filter).populate("partnerId");
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
