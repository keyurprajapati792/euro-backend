import nodemailer from "nodemailer";

export const sendSMS = async (to, subject, message) => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for others
      auth: {
        user: process.env.SMTP_USER, // e.g. your Gmail
        pass: process.env.SMTP_PASS, // app password or SMTP key
      },
    });

    // Mail options
    const mailOptions = {
      from: `"Eureka Forbes" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    };

    // Send the mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

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
