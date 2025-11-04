import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String }, // Partner or store name
    contactPerson: { type: String, required: true }, // The individual’s name
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    partner_type: {
      type: String,
      enum: ["Service Partner", "Direct Sales Partner", "Retail Sales Partner"],
      required: true,
    },
    sub_type: {
      type: String,
      enum: ["CRC", "Partner", "GT", "MT", "AF", ""],
    },
    visit_date: { type: String },
    empId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
