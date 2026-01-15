import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import Attendance from "@/models/Attendance";
import { requireAuth } from "@/lib/requireAuth";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const auth = await requireAuth();
    const organizationId = auth.organizationId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);

    const totalStudents = await Student.countDocuments({
      organizationId,
    });

    const activeStudents = await Student.countDocuments({
      organizationId,
      status: "ACTIVE",
    });

    const expiredStudents = await Student.countDocuments({
      organizationId,
      status: "EXPIRED",
    });

    const expiringSoon = await Student.find({
      organizationId,
      expiryDate: { $gte: today, $lte: weekLater },
    })
      .select("name phone expiryDate")
      .limit(5);

    const revenueAgg = await Payment.aggregate([
      {
        $match: {
          organizationId:new mongoose.Types.ObjectId(organizationId),
          status: "SUCCESS",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: "SUCCESS",
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const todayAttendance = await Attendance.countDocuments({
      organizationId,
      date: today,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        expiredStudents,
        totalRevenue,
        todayAttendance,
      },
      expiringSoon,
      monthlyRevenue,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
}
