import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: false }, // could be text, option, or number
    remark: { type: String, default: "" },
    type: {
      type: String,
      enum: ["options", "text", "rating", "multichoice"],
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
    customerId: { type: String },
    customerName: { type: String },
    customerContact: { type: String },
    customerStoreName: { type: String },
    customerStoreLocation: { type: String },
    visitType: { type: String },
    state: { type: String, enum: ["draft", "submitted"] },
    responses: [responseSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Survey = mongoose.model("Survey", surveySchema);
