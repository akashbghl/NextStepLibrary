import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { requireAuth } from "@/lib/requireAuth";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const auth = await requireAuth();
    const organizationId = auth.organizationId;

    const orgObjectId = new mongoose.Types.ObjectId(
      organizationId
    );

    /* ============================
       Date Range
    ============================ */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next3Days = new Date(today);
    next3Days.setDate(today.getDate() + 3);

    /* ============================
       Fetch Expiring Students
    ============================ */

    const expiring = await Student.find({
      organizationId: orgObjectId,
      expiryDate: {
        $gte: today,
        $lte: next3Days,
      },
    })
      .select("name expiryDate")
      .sort({ expiryDate: 1 })
      .limit(10);

    /* ============================
       Map Notifications
    ============================ */

    const notifications = expiring.map((s) => {
      const daysLeft = Math.ceil(
        (new Date(s.expiryDate).getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      console.log("Students:",s);
      return {
        id: s._id.toString(),
        title: "Subscription Expiring",
        message:
          daysLeft === 0
            ? `${s.name} expires today`
            : `${s.name} expires in ${daysLeft} day${
                daysLeft > 1 ? "s" : ""
              }`,
        expiryDate: s.expiryDate,
        daysLeft,
        type: "warning",
      };
    });

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error: any) {
    console.error("Notifications API Error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load notifications",
      },
      { status: 401 }
    );
  }
}
