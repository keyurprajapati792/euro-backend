import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: false }, // could be text, option, or number
    remark: { type: String, default: "" },
    type: {
      type: String,
      enum: ["options", "text", "rating"],
      default: "options",
    },
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    vertical: {
      type: String,
      enum: ["service_partner", "retail_sales_partner", "direct_sales_partner"],
      required: true,
    },
    visitType: { type: String, required: true },
    responses: [responseSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Survey = mongoose.model("Survey", surveySchema);
