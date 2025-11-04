import Employee from "../models/employee.js";
import Otp from "../models/otp.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../utils/sendSMS.js";

dotenv.config();

export class AuthService {
  // 🔹 Admin login (hardcoded)
  static async sendAdminOTP(contact) {
    const adminContacts = process.env.ADMIN_CONTACTS?.split(",") || [];

    // Validate contact
    if (!adminContacts.includes(contact)) {
      throw new Error("Unauthorized admin contact");
    }

    const smsUrl = `https://sms6.rmlconnect.net:8443/OtpApi/otpgenerate?username=EUROC2C&password=${process.env.RML_PASSWORD}&msisdn=${contact}&source=EUREKA&otplen=4&exptime=120&msg=OTP%20for%20logging%20into%20your%20EuroC2C%20Account%20is%20%25m%20and%20valid%20for%202%20minutes.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20to%20anyone.%20Eureka%20Forbes`;

    const response = await axios.post(smsUrl);
    const respStr = response?.data?.toString() || "";

    if (!respStr.includes("1701")) throw new Error("Failed to send OTP");

    return { otpSent: true };
  }

  // ✅ Verify admin OTP
  static async verifyAdminOTP(contact, otp) {
    const verifyUrl = `https://sms6.rmlconnect.net:8443/OtpApi/checkotp?username=EUROC2C&password=${process.env.RML_PASSWORD}&msisdn=${contact}&otp=${otp}`;

    const response = await axios.get(verifyUrl);
    const result = response.data;

    if (result != 101) throw new Error("Invalid or expired OTP");

    const token = jwt.sign({ role: "admin", contact }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return { success: true, token };
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

    const response = await axios.post(
      `https://sms6.rmlconnect.net:8443/OtpApi/otpgenerate?username=EUROC2C&password=${process.env.RML_PASSWORD}&msisdn=${employee.contact}&source=EUREKA&otplen=4&exptime=120&msg=OTP%20for%20logging%20into%20your%20EuroC2C%20Account%20is%20%25m%20and%20valid%20for%202%20minutes.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20to%20anyone.%20Eureka%20Forbes`
    );

    const respStr = response?.data != null ? response.data.toString() : "";

    if (!respStr.includes("1701")) {
      throw new Error(`Something went wrong while sending OTP.`);
    }

    // success
    return {
      success: true,
      message: "OTP sent successfully",
      data: {
        otpSent: true,
        employeeId: employee._id,
        phone: employee.contact,
        providerResponse: respStr,
      },
    };
  }

  // 🔹 Verify OTP
  static async verifyEmployeeOTP(empId, code) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee with this ID does not exist");
    if (!employee.contact) throw new Error("Employee mobile number not found");

    const url = `https://sms6.rmlconnect.net:8443/OtpApi/checkotp?username=EUROC2C&password=${process.env.RML_PASSWORD}&msisdn=${employee.contact}&otp=${code}`;

    const response = await axios.get(url);
    const result = response.data;

    if (result == 101) {
      // generate token here
      const token = jwt.sign(
        { id: employee._id, role: "employee" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
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

    throw new Error("Invalid OTP or expired");
  }

  static async sendEmailOTP(empId, email) {
    const employee = await Employee.findOne({ empId });
    if (!employee) throw new Error("Employee with this ID does not exist");

    if (email) {
      employee.email = email;
      await employee.save();
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.create({ email: employee.email, otp });

    // Email Template
    const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>OTP Verification</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
        <div style="max-width:480px; margin:auto; background:#ffffff; border-radius:10px; padding:20px; text-align:center;">

         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:15px;">
  <tr>
    <td align="center" style="padding-bottom:10px;">
      <img src="https://res.cloudinary.com/dsoz1zsww/image/upload/v1761857677/Euro-C2C_logo_Blue_2025_kjqclq.png"
        alt="Logo 1"
        style="max-width:140px; width:48%; height:auto; display:inline-block; vertical-align:middle; margin-right:4px;" />
      
      <img src="https://res.cloudinary.com/dsoz1zsww/image/upload/v1761857676/EFL_Final_Logo_Nov_2020_pc_friends_for_life-1_v9lrmx.png"
        alt="Logo 2"
        style="max-width:140px; width:48%; height:auto; display:inline-block; vertical-align:middle; margin-left:4px;" />
    </td>
  </tr>
</table>


          <h2 style="color:#1e90ff; margin-bottom:8px;">OTP Verification</h2>

          <p style="font-size:16px; color:#333; text-align:left;">
            Hello <b>${employee.name || employee.fullName || ""}</b>,
          </p>

          <p style="font-size:16px; color:#333; text-align:left;">
  Hello <b>${employee.name || employee.fullName || ""}</b>,
</p>

<p style="font-size:15px; color:#555; text-align:left;">
  Your One-Time Password (OTP) for login is:
</p>

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

<p style="font-size:14px; color:#777;">
  This OTP is valid for 2 minutes. Please do not share it with anyone.
</p>


        </div>
      </div>
    </body>
  </html>
  `;

    const res = await sendEmail(
      employee.email,
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
