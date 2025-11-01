import { AuthService } from "../services/auth.service.js";

export class AuthController {
  // Admin login
  static adminLogin = (req, res) => {
    try {
      const { email, password } = req.body;

      const token = AuthService.adminLogin(email, password);

      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Admin login successful",
        data: { loggedIn: true },
      });
    } catch (error) {
      return res.status(401).json({
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
      const { empId, code } = req.body;

      const result = await AuthService.verifyEmployeeOTP(empId, code);

      res.cookie("authToken", result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: result.message,
        data: {
          role: "employee",
          employee: result.data.employee,
        },
      });
    } catch (error) {
      console.log("OTP VERIFY ERROR:", error.message);
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid OTP or expired",
      });
    }
  };

  static async sendEmailOTP(req, res) {
    try {
      const { empId, email } = req.body;
      const result = await AuthService.sendEmailOTP(empId, email);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async verifyEmailOTP(req, res) {
    try {
      const { email, code } = req.body;

      const result = await AuthService.verifyEmailOTP(email, code);

      res.cookie("authToken", result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Login successful",
        data: {
          role: "employee",
          employee: result.data.employee,
        },
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
