import Employee from "../models/employee.js";
import Otp from "../models/otp.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../utils/sendSMS.js";

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

  static async sendEmployeeOTP(empId, phone) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee with this ID does not exist");

    if (phone) {
      employee.contact = phone;
      await employee.save();
    }

    if (!employee.contact) {
      throw new Error("Employee contact number not found");
    }

    // const SMS_URL = "http://sms6.rmlconnect.net:8080/OtpApi/otpgenerate";

    // const params = {
    //   username: "EUROC2C",
    //   password: process.env.RML_PASSWORD,
    //   msisdn: employee.contact,
    //   source: "EUREKA",
    //   otplen: 4,
    //   exptime: 120,
    //   msg: `OTP for login in to your EuroC2C Account is %m and valid for 2m. OTPs are SECRET. DO NOT disclose to anyone. Eureka Forbes`,
    // };

    // params.msg = encodeURIComponent(params.msg);

    // const response = await axios.get(SMS_URL, { params });

    const response = await axios.post(
      "https://cpaas.messagecentral.com/verification/v3/send",
      {}, // body must be empty object
      {
        params: {
          countryCode: 91,
          mobileNumber: employee.contact,
          flowType: "SMS",
          customerId: process.env.CUSTOMER_ID,
        },
        headers: {
          authToken: process.env.MESSAGE_CENTRAL_TOKEN,
        },
      }
    );

    return {
      success: true,
      message: "OTP sent successfully",
      data: {
        otpSent: true,
        employeeId: employee._id,
        phone: employee.contact,
        verificationId: response.data.data.verificationId,
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
          authToken: process.env.MESSAGE_CENTRAL_TOKEN,
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
  static async sendEmailOTP(email) {
    const employee = await Employee.findOne({ email });
    if (!employee) throw new Error("Employee email does not exist");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.create({ email, otp });

    const htmlTemplate = `
    <!DOCTYPE html>
<html>
  <head>
    <title>OTP Verification</title>
  </head>
  <body>
    <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
      <div style="max-width:480px; margin:auto; background:#ffffff; border-radius:10px; padding:20px; text-align:center;">

        <!-- Logos -->
        <div style="margin-bottom:15px;">
          <img src="https://res.cloudinary.com/dsoz1zsww/image/upload/v1761857677/Euro-C2C_logo_Blue_2025_kjqclq.png" alt="Logo" style="height:50px; margin-right:8px;" />
          <img src="https://res.cloudinary.com/dsoz1zsww/image/upload/v1761857676/EFL_Final_Logo_Nov_2020_pc_friends_for_life-1_v9lrmx.png" alt="Logo" style="height:50px; margin-left:8px;" />
        </div>

        <h2 style="color:#1e90ff; margin-bottom:8px;">OTP Verification</h2>
        
        <p style="font-size:16px; color:#333; text-align:left;">
          Hello <b>${employee.name || employee.fullName || ""}</b>,
        </p>

        <p style="font-size:15px; color:#555; text-align:left;">
          Your One-Time Password (OTP) for login is:
        </p>

        <!-- OTP Box -->
        <h1 style="
          font-size:18px;
          letter-spacing:6px;
          background:#1e90ff;
          color:#fff;
          padding:12px 18px;
          border-radius:8px;
          display:inline-block;
          margin:10px auto;
          font-weight:bold;
        ">
          ${otp}
        </h1>

        <p style="font-size:14px; color:#777; text-align:center;">
          This OTP is valid for 2 minutes. Do not share it with anyone.
        </p>

      </div>
    </div>
  </body>
</html>

  `;

    const res = await sendEmail(
      email,
      "Your Login OTP",
      `Your OTP is: ${otp}`,
      htmlTemplate
    );

    if (!res.success) throw new Error("Failed to send OTP email");

    return {
      success: true,
      message: "OTP sent to email successfully",
    };
  }

  static async verifyEmailOTP(email, code) {
    const record = await Otp.findOne({ email, otp: code });
    if (!record) throw new Error("Invalid or expired OTP");

    const employee = await Employee.findOne({ email });
    if (!employee) throw new Error("Employee not found");

    const token = jwt.sign(
      { role: "employee", empId: employee.empId, id: employee._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await Otp.deleteMany({ email });

    return {
      success: true,
      message: "",
      data: { employee, token },
    };
  }
}
