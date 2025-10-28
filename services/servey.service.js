import { Parser } from "json2csv";
import Partner from "../models/partner.js";
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
  static async getAllSurveys({ partner_type, search, page = 1, limit = 10 }) {
    const filter = {};
    if (partner_type && partner_type !== "All") {
      filter.partnerType = partner_type;
    }

    const skip = (page - 1) * limit;
    let surveysQuery = Survey.find(filter).populate("partnerId");

    if (search) {
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

    const [surveys, total] = await Promise.all([
      surveysQuery.skip(skip).limit(limit),
      surveysQuery.clone().countDocuments(),
    ]);

    return {
      surveys,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
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

  //Download csv
  static async exportSurveysToCSV(filter = {}) {
    const surveys = await Survey.find(filter).populate(
      "partnerId",
      "name contactPerson phone partner_type city"
    );

    if (!surveys.length) {
      throw new Error("No surveys found to export");
    }

    const formatted = surveys.map((s) => ({
      "Partner Name": s.partnerId?.name || "N/A",
      " Contact Person": s.partnerId?.contactPerson || "N/A",
      Phone: s.partnerId?.phone || "N/A",
      City: s.partnerId?.city || "N/A",
      "Partner Type": s.partnerType,
      "Visit Type": s.visitType,
      "Submitted At": s.submittedAt.toISOString().split("T")[0],
      Responses: s.responses
        .map(
          (r) => `${r.question}: ${r.answer}${r.remark ? ` (${r.remark})` : ""}`
        )
        .join("; "),
    }));

    const json2csv = new Parser({ header: true });
    const csv = json2csv.parse(formatted);

    return csv;
  }
}
