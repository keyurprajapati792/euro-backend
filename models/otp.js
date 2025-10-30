import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 2 * 60 * 1000, // 2 minutes expiry
      index: { expires: 120 }, // auto delete after 2 mins
    },
  },
  { timestamps: true }
);

// Remove old OTPs for same email before saving new one
OTPSchema.pre("save", async function (next) {
  await mongoose.model("Otp").deleteMany({ email: this.email });
  next();
});

export default mongoose.model("otp", OTPSchema);
