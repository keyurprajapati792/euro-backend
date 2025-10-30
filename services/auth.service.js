import Employee from "../models/employee.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class AuthService {
  // 🔹 Admin login (hardcoded)
  static adminLogin(email, password) {
    if (email !== process.env.ADMIN_EMAIL) {
      throw new Error("Admin email is incorrect");
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      throw new Error("Admin password is incorrect");
    }

    const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return token;
  }

  // 🔹 Send OTP
  static async sendEmployeeOTP(empId) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee with this ID does not exist");

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

  // 🔹 Verify OTP
  static async verifyEmployeeOTP(empId, code, verificationId) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee with this ID does not exist");

    if (!employee.contact) throw new Error("Employee mobile number not found");

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
      throw new Error("Incorrect OTP");
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
