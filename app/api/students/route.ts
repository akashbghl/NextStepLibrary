import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import {
  validate,
  studentCreateSchema,
  studentUpdateSchema,
} from "@/lib/validators";

/* ============================
   GET → Fetch all students
============================ */
export async function GET() {
  try {
    await connectDB();

    const students = await Student.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* ============================
   POST → Create student
============================ */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const data = validate(studentCreateSchema, body);

    // 🧮 Calculate expiry date based on plan
    const startDate = new Date(data.startDate);
    const expiryDate = new Date(startDate);

    const PLAN_MAP: Record<string, number> = {
      "1_MONTH": 1,
      "3_MONTH": 3,
      "6_MONTH": 6,
      "12_MONTH": 12,
    };

    expiryDate.setMonth(
      expiryDate.getMonth() + PLAN_MAP[data.plan]
    );

    const student = await Student.create({
      ...data,
      startDate,
      expiryDate,
    });

    return NextResponse.json({
      success: true,
      message: "Student added successfully",
      student,
    });
  } catch (error: any) {
    console.error("Create Student Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

/* ============================
   PUT → Update student
============================ */
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { id, ...payload } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Student ID required" },
        { status: 400 }
      );
    }

    const data = validate(studentUpdateSchema, payload);

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("Update Student Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

/* ============================
   DELETE → Remove student
============================ */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Student ID required" },
        { status: 400 }
      );
    }

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Student Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
