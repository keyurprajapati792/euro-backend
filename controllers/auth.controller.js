import { AuthService } from "../services/auth.service.js";

export class AuthController {
  // Admin login
  static adminLogin = (req, res) => {
    try {
      const { email, password } = req.body;
      const token = AuthService.adminLogin(email, password);
      res.json({
        success: true,
        data: token,
        message: "Admin login successful",
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  };

  // Employee send OTP
  static sendEmployeeOTP = async (req, res) => {
    try {
      const { empId, phone } = req.body;
      const result = await AuthService.sendEmployeeOTP(empId, phone);
      res.json({
        success: true,
        message: "OTP has been sent to your registered mobile number",
        data: result.data, // only include data structure once
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message || "Unable to send OTP",
      });
    }
  };

  // Employee verify OTP
  static verifyEmployeeOTP = async (req, res) => {
    try {
      const { empId, code, verificationId } = req.body;
      const data = await AuthService.verifyEmployeeOTP(
        empId,
        code,
        verificationId
      );
      res.json({
        success: true,
        data,
        message: "OTP verified successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        success: false,
        message: error.message || "Invalid OTP or expired",
      });
    }
  };

  static async sendEmailOTP(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.sendEmailOTP(email);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async verifyEmailOTP(req, res) {
    try {
      const { email, code } = req.body;

      const result = await AuthService.verifyEmailOTP(email, code);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
