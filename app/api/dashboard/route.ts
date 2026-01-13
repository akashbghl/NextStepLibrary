import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import Attendance from "@/models/Attendance";

/* ============================
   GET → Dashboard Analytics
============================ */
export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekLater = new Date();
    weekLater.setDate(today.getDate() + 7);

    /* ======================
        BASIC COUNTS
    ====================== */

    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({
      status: "ACTIVE",
    });
    const expiredStudents = await Student.countDocuments({
      status: "EXPIRED",
    });

    /* ======================
        EXPIRING SOON
    ====================== */

    const expiringSoon = await Student.find({
      expiryDate: { $gte: today, $lte: weekLater },
    })
      .select("name phone expiryDate")
      .limit(5);

    /* ======================
        REVENUE STATS
    ====================== */

    const revenueAgg = await Payment.aggregate([
      {
        $match: { status: "SUCCESS" },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "SUCCESS",
          paidAt: {
            $gte: new Date(
              new Date().setMonth(new Date().getMonth() - 6)
            ),
          },
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

    /* ======================
        TODAY ATTENDANCE
    ====================== */

    const todayAttendance = await Attendance.countDocuments({
      date: today,
    });

    /* ======================
        RESPONSE
    ====================== */

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
      { status: 500 }
    );
  }
}
