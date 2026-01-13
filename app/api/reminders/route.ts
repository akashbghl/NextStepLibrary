import { NextRequest, NextResponse } from "next/server";
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
 * Send reminder to one student
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

/* ============================
   POST → Trigger reminders manually
============================ */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") ?? 3);

    // Find students expiring in N days or expired
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);

    const students = await Student.find({
      expiryDate: { $lte: targetDate },
    });

    let sentCount = 0;

    for (const student of students) {
      const daysLeft = getDaysDiff(
        new Date(student.expiryDate)
      );

      await notifyStudent(student, daysLeft);
      sentCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      count: sentCount,
    });
  } catch (error: any) {
    console.error("Reminder API Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
