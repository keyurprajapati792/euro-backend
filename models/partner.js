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
      enum: ["service_partner", "direct_sales_partner", "retail_sales_partner"],
      required: true,
    },
    sub_type: {
      type: String,
      enum: ["MS", "IR", "CRC", "Partner", "GT", "MT", "AF"],
    },

    empId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
