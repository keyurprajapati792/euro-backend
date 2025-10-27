import Employee from "../models/employee.js";
import axios from "axios";
import jwt from "jsonwebtoken";

export class AuthService {
  // Admin login (hardcoded)
  static adminLogin(email, password) {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      return token;
    }
    throw new Error("Invalid admin credentials");
  }

  // Send OTP to employee
  static async sendEmployeeOTP(empId) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee not found");

    const mobileNumber = employee.contact;

    const response = await axios.post(
      "https://cpaas.messagecentral.com/verification/v3/send",
      {},
      {
        params: {
          countryCode: 91,
          customerId: "C-32D9BA56A8BF411",
          flowType: "SMS",
          mobileNumber,
        },
      }
    );

    return {
      verificationId: response.data.verificationId || response.data.id,
      employeeId: employee._id,
    };
  }

  // Verify employee OTP
  static async verifyEmployeeOTP(empId, code, verificationId) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee not found");

    const mobileNumber = employee.contact;

    const response = await axios.get(
      "https://cpaas.messagecentral.com/verification/v3/validateOtp",
      {
        params: {
          countryCode: 91,
          mobileNumber,
          verificationId,
          customerId: "C-32D9BA56A8BF411",
          code,
        },
      }
    );

    if (response.status === 200) {
      const token = jwt.sign(
        { role: "employee", empId: employee.empId, id: employee._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      return token;
    }

    throw new Error("Invalid OTP");
  }
}
