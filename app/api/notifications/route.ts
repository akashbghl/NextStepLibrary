import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { requireAuth } from "@/lib/requireAuth";
import mongoose from "mongoose";

export async function GET() {
  await connectDB();
  const auth = await requireAuth();
  const organizationId = auth.organizationId;
  const organizationObjId = new mongoose.Types.ObjectId(organizationId);

  const today = new Date();
  const next3Days = new Date();
  next3Days.setDate(today.getDate() + 3);

  // Expiring soon students
  const expiring = await Student.find({
    organizationId: organizationObjId,
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
