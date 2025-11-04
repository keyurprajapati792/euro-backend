import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String },
    contactPerson: { type: String, required: true },
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

    employeeVisits: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          required: true,
        },
        visitDate: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
