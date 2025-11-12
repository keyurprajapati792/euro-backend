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

    // Add submittedAt only for final submission
    if (data.state === "submitted") {
      data.submittedAt = new Date();
    }

    // Create new survey only — no updating, no searching
    const newSurvey = await Survey.create(data);

    return newSurvey;
  }

  // services/servey.service.js

  static async updateSurvey(id, data) {
    if (!id) throw new Error("Survey ID is required");

    const existingSurvey = await Survey.findById(id);
    if (!existingSurvey) throw new Error("Survey not found");

    // If changing state to submitted, set submittedAt timestamp
    if (data.state === "submitted" && !existingSurvey.submittedAt) {
      data.submittedAt = new Date();
    }

    const updatedSurvey = await Survey.findByIdAndUpdate(id, data, {
      new: true,
    });

    return updatedSurvey;
  }

  // 🟦 Get all surveys
  static async getAllSurveys({ partner_type, search, page = 1, limit = 10 }) {
    const filter = { state: "submitted" };
    if (partner_type && partner_type !== "All") {
      filter.partnerType = partner_type;
    }

    const skip = (page - 1) * limit;
    let surveysQuery = Survey.find(filter)
      .populate("partnerId")
      .populate("empId")
      .sort({ submittedAt: -1 });

    if (search) {
      const partners = await Partner.find({
        $or: [
          { name: new RegExp(search, "i") },
          { contactPerson: new RegExp(search, "i") },
          { phone: new RegExp(search, "i") },
        ],
      }).select("_id");

      surveysQuery = surveysQuery.find({
        $or: [
          { partnerId: { $in: partners.map((p) => p._id) } },
          { customerName: new RegExp(search, "i") },
          { customerContact: new RegExp(search, "i") },
        ],
      });
    }

    const [surveys, total] = await Promise.all([
      surveysQuery.skip(skip).limit(limit),
      Survey.countDocuments(filter),
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
    const surveys = await Survey.find(filter)
      .populate("partnerId", "name contactPerson phone city partner_type")
      .populate("empId", "firstname lastname empId contact");

    if (!surveys.length) throw new Error("No surveys found to export");

    const formatted = [];

    let serial = 1; // 🔹 Start serial numbering

    surveys.forEach((s) => {
      s.responses.forEach((r, index) => {
        formatted.push({
          "Serial Number": index === 0 ? serial : "", // only on first row of each survey
          "Customer ID": index === 0 ? s.customerId ?? "N/A" : "",
          "Customer Name": index === 0 ? s.customerName ?? "N/A" : "",
          "Customer Phone": index === 0 ? s.customerContact ?? "N/A" : "",
          "Customer Store Name":
            index === 0 ? s.customerStoreName ?? "N/A" : "",
          "Customer Store Location":
            index === 0 ? s.customerStoreLocation ?? "N/A" : "",
          "Employee Name":
            index === 0
              ? `${s.empId?.firstname ?? "N/A"} ${
                  s.empId?.lastname ?? ""
                }`.trim()
              : "",
          "Employee ID": index === 0 ? s.empId?.empId ?? "N/A" : "",
          "Employee Contact": index === 0 ? s.empId?.contact ?? "N/A" : "",
          "Partner Name": index === 0 ? s.partnerId?.name ?? "N/A" : "",
          "Partner Contact Person":
            index === 0 ? s.partnerId?.contactPerson ?? "N/A" : "",
          "Partner Phone": index === 0 ? s.partnerId?.phone ?? "N/A" : "",
          City: index === 0 ? s.partnerId?.city ?? "N/A" : "",
          "Partner Type":
            index === 0
              ? s.partnerType ?? s.partnerId?.partner_type ?? "N/A"
              : "",
          "Visit Type": index === 0 ? s.visitType ?? "N/A" : "",
          "Submitted Date":
            index === 0
              ? s.submittedAt
                ? new Date(s.submittedAt).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A"
              : "",
          "Submitted Time":
            index === 0
              ? s.submittedAt
                ? new Date(s.submittedAt).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "N/A"
              : "",
          Question: r.question ?? "N/A",
          Answer: Array.isArray(r.answer)
            ? r.answer.join(", ")
            : r.answer ?? "N/A",
          Remark: r.remark ?? "N/A",
        });
      });

      serial++; // 🔹 Increment after each survey
    });

    const parser = new Parser({ header: true });
    return parser.parse(formatted);
  }
}
