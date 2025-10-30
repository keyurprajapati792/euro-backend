import { Parser } from "json2csv";
import Partner from "../models/partner.js";
import { Survey } from "../models/survey.js";
import mongoose from "mongoose";

export class SurveyService {
  // 🟩 Submit a new survey
  static async submitSurvey(data) {
    if (
      !data.partnerId ||
      !data.partnerType ||
      !data.visitType ||
      !data.responses
    ) {
      throw new Error("All required fields must be provided");
    }

    // Auto add submittedAt only when final submission
    if (data.state === "submitted") {
      data.submittedAt = new Date();
    }

    const updatedSurvey = await Survey.findOneAndUpdate(
      {
        partnerId: data.partnerId,
        partnerType: data.partnerType,
        visitType: data.visitType,
        customerId: data.customerId,
      },
      { $set: data },
      { new: true, upsert: true }
    );

    return updatedSurvey;
  }

  // 🟦 Get all surveys
  static async getAllSurveys({ partner_type, search, page = 1, limit = 10 }) {
    const filter = { state: "submitted" };
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
  static async getSurveyByEmployee({ partnerType, empId, partnerId }) {
    const filter = {
      partnerType,
      state: "draft",
      empId: new mongoose.Types.ObjectId(empId),
      partnerId: new mongoose.Types.ObjectId(partnerId),
    };

    const surveys = await Survey.find(filter);
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
      "name contactPerson phone city partner_type"
    );

    if (!surveys.length) {
      throw new Error("No surveys found to export");
    }

    const formatted = [];

    surveys.forEach((s) => {
      s.responses.forEach((r, index) => {
        formatted.push({
          "Customer ID": index === 0 ? s.customerId : "",
          "Customer Name": index === 0 ? s.customerName : "",
          "Customer Phone": index === 0 ? s.customerContact : "",
          "Customer Email": index === 0 ? s.customerEmail : "",

          "Partner Name": index === 0 ? s.partnerId?.name || "" : "",
          "Partner Contact Person":
            index === 0 ? s.partnerId?.contactPerson || "" : "",
          "Partner Phone": index === 0 ? s.partnerId?.phone || "" : "",
          City: index === 0 ? s.partnerId?.city || "" : "",
          "Partner Type":
            index === 0 ? s.partnerType || s.partnerId?.partner_type || "" : "",

          "Visit Type": index === 0 ? s.visitType || "" : "",
          "Submitted At":
            index === 0
              ? s.submittedAt
                ? new Date(s.submittedAt).toISOString().split("T")[0]
                : ""
              : "",

          Question: r.question,
          Answer: r.answer,
          Remark: r.remark || "",
        });
      });
    });

    const parser = new Parser({ header: true });
    return parser.parse(formatted);
  }
}
