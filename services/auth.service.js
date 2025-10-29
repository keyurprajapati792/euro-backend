import Employee from "../models/employee.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class AuthService {
  // 🔹 Admin login (hardcoded)
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

  // 🔹 Send OTP (mocked for now)
  static async sendEmployeeOTP(empId) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee not found");

    const response = await axios.post(
      "https://cpaas.messagecentral.com/verification/v3/send",
      {},
      {
        headers: {
          authToken:
            "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTMyRDlCQTU2QThCRjQxMSIsImlhdCI6MTc2MTMzMzYzNCwiZXhwIjoxOTE5MDEzNjM0fQ.6ptoXUPHUGgaikzv3fawylJn84kLSYFGpfM9hNBplswHiqLtPVcUKoObGbwQFdIGELfoXL4BYiLj_TYCDetwuQ",
        },
        params: {
          countryCode: 91,
          customerId: process.env.CUSTOMER_ID,
          flowType: "SMS",
          mobileNumber: employee.contact,
        },
      }
    );

    return {
      success: true,
      message: "OTP sent successfully",
      data: {
        verificationId: response.data.data.verificationId || response.data.id,
        employeeId: employee._id,
      },
    };
  }

  // 🔹 Verify OTP (mocked, returns employee + token)
  static async verifyEmployeeOTP(empId, code, verificationId) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee not found");

    const response = await axios.get(
      "https://cpaas.messagecentral.com/verification/v3/validateOtp",
      {
        headers: {
          authToken:
            "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTMyRDlCQTU2QThCRjQxMSIsImlhdCI6MTc2MTMzMzYzNCwiZXhwIjoxOTE5MDEzNjM0fQ.6ptoXUPHUGgaikzv3fawylJn84kLSYFGpfM9hNBplswHiqLtPVcUKoObGbwQFdIGELfoXL4BYiLj_TYCDetwuQ",
        },
        params: {
          countryCode: 91,
          mobileNumber: employee.contact,
          verificationId,
          customerId: process.env.CUSTOMER_ID,
          code,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Invalid OTP");
    }

    const token = jwt.sign(
      { role: "employee", empId: employee.empId, id: employee._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    return {
      success: true,
      message: "OTP verified successfully",
      data: {
        employee,
        token,
      },
    };
  }
}
