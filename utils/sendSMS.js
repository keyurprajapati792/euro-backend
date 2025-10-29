import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendSMS = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: `${procees.env.SMTP_HOST}`,
      port: `${procees.env.SMTP_PORT}`,
      secure: false,
      auth: {
        user: `${procees.env.SMTP_USER}`,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Mail options
    const mailOptions = {
      from: `${process.env.SMTP_USER}`,
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    };

    // Send the mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending mail:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

sendSMS();
