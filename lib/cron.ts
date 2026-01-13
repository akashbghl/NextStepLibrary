import cron from "node-cron";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { sendMail } from "@/lib/mail";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * Utility: Days difference
 */
function getDaysDiff(date: Date) {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Send reminder to a student
 */
async function notifyStudent(student: any, daysLeft: number) {
  const message =
    daysLeft > 0
      ? `Hello ${student.name}, your subscription will expire in ${daysLeft} day(s). Please renew.`
      : `Hello ${student.name}, your subscription has expired. Please renew to continue services.`;

  // 📧 Email
  if (student.email) {
    await sendMail({
      to: student.email,
      subject: "Subscription Reminder",
      html: `
        <h3>Hello ${student.name},</h3>
        <p>${message}</p>
        <p>Thank you.</p>
      `,
    });
  }

  // 📱 WhatsApp
  if (student.phone) {
    await sendWhatsAppMessage({
      to: student.phone,
      message,
    });
  }
}

/**
 * Daily Cron Job
 * Runs everyday at 9 AM
 */
export function startReminderCron() {
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running Reminder Cron Job");

    try {
      await connectDB();

      const students = await Student.find({
        status: "ACTIVE",
      });

      for (const student of students) {
        const daysLeft = getDaysDiff(
          new Date(student.expiryDate)
        );

        // Reminder logic
        if ([3, 1, 0, -1].includes(daysLeft)) {
          await notifyStudent(student, daysLeft);
        }

        // Auto expire update
        if (daysLeft < 0 && student.status !== "EXPIRED") {
          student.status = "EXPIRED";
          await student.save();
        }
      }

      console.log("✅ Reminder job completed");
    } catch (error) {
      console.error("❌ Cron failed:", error);
    }
  });
}
