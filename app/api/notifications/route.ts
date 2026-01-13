import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function GET() {
  await connectDB();

  const today = new Date();
  const next3Days = new Date();
  next3Days.setDate(today.getDate() + 3);

  // Expiring soon students
  const expiring = await Student.find({
    expiryDate: { $lte: next3Days, $gte: today },
  }).select("name expiryDate");

  const notifications = expiring.map((s) => ({
    id: s._id,
    title: "Subscription Expiring",
    message: `${s.name} expires on ${new Date(
      s.expiryDate
    ).toLocaleDateString()}`,
    type: "warning",
  }));

  return NextResponse.json({
    success: true,
    notifications,
  });
}
