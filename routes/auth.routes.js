import express from "express";
import { AuthController } from "../controllers/auth.controller.js";

const router = express.Router();

// Admin login
router.post("/admin/login", AuthController.adminLogin);

// Employee OTP login
router.post("/employee/send-otp", AuthController.sendEmployeeOTP);
router.post("/employee/verify-otp", AuthController.verifyEmployeeOTP);

export default router;
