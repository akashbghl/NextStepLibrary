import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

/* ============================
   GET → Fetch attendance
============================ */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date"); // yyyy-mm-dd

    const filter: any = {};

    if (studentId) filter.student = studentId;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate("student", "name phone")
      .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error: any) {
    console.error("Fetch Attendance Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* ============================
   POST → Check-in
============================ */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { studentId, source = "MANUAL" } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID required" },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent duplicate entry
    const alreadyMarked = await Attendance.findOne({
      student: studentId,
      date: today,
    });

    if (alreadyMarked) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance already marked today",
        },
        { status: 409 }
      );
    }

    const attendance = await Attendance.create({
      student: studentId,
      date: today,
      checkIn: new Date(),
      source,
    });

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error: any) {
    console.error("Attendance Mark Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

/* ============================
   PUT → Check-out
============================ */
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { attendanceId } = body;

    if (!attendanceId) {
      return NextResponse.json(
        { success: false, message: "Attendance ID required" },
        { status: 400 }
      );
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    attendance.checkOut = new Date();
    await attendance.save();

    return NextResponse.json({
      success: true,
      message: "Check-out successful",
      attendance,
    });
  } catch (error: any) {
    console.error("Checkout Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
