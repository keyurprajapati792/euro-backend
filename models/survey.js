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
    empId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    partnerType: {
      type: String,
      enum: ["Service Partner", "Retail Sales Partner", "Direct Sales Partner"],
      required: true,
    },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerContact: { type: String, required: true },
    customerEmail: { type: String, required: true },
    visitType: { type: String, required: true },
    state: { type: String, enum: ["draft", "submitted"] },
    responses: [responseSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Survey = mongoose.model("Survey", surveySchema);
