import express from "express";
import { AuthController } from "../controllers/auth.controller.js";

const router = express.Router();

// ✅ Admin OTP login
router.post("/admin/send-otp", AuthController.sendAdminOTP);
router.post("/admin/verify-otp", AuthController.verifyAdminOTP);

// ✅ Employee OTP login
router.post("/employee/send-otp", AuthController.sendEmployeeOTP);
router.post("/employee/verify-otp", AuthController.verifyEmployeeOTP);

// ✅ Employee Email OTP login
router.post("/employee/send-email-otp", AuthController.sendEmailOTP);
router.post("/employee/verify-email-otp", AuthController.verifyEmailOTP);

export default router;
