import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: { type: String, trim: true },
    address: { type: String },
    city: { type: String, trim: true },
    partner_type: {
      type: String,
      enum: ["Service Partner", "Direct Sales Partner", "Retail Sales Partner"],
      required: true,
    },
    sub_type: {
      type: String,
      enum: ["CRC", "Partner", "GT", "MT", "AF", ""],
    },
    employeeVisits: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        visitDate: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
