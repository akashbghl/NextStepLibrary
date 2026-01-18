import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔐 Protect cron endpoint
    const secret = req.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Expire all students whose expiryDate < today
    const result = await Student.updateMany(
      {
        expiryDate: { $lt: today },
        status: "ACTIVE",
      },
      {
        $set: { status: "EXPIRED" },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Expired students updated",
      modified: result.modifiedCount,
    });
  } catch (error: any) {
    console.error("Cron Expire Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
