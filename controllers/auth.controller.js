import { AuthService } from "../services/auth.service.js";

export class AuthController {
  // Admin login
  static adminLogin = (req, res) => {
    try {
      const { email, password } = req.body;
      const token = AuthService.adminLogin(email, password);
      res.json({ success: true, data: token });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  };

  // Employee send OTP
  static sendEmployeeOTP = async (req, res) => {
    try {
      const { empId } = req.body;
      const result = await AuthService.sendEmployeeOTP(empId);
      res.json({ success: true, message: "OTP sent", ...result });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, message: error.message });
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
      res.json({ success: true, data });
    } catch (error) {
      console.log(error);
      res.status(401).json({ success: false, message: error.message });
    }
  };
}
