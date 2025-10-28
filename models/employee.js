import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    empId: { type: String, required: true, unique: true },
    contact: { type: String },
    servicePartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
    directPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
    retailPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
