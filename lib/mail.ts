import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("❌ EMAIL_USER or EMAIL_PASS not defined in env");
}

/**
 * Create reusable transporter
 */
export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Send Email Helper
 */
interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({
  to,
  subject,
  html,
}: SendMailOptions) {
  try {
    const info = await mailTransporter.sendMail({
      from: `"NextStep" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
}
