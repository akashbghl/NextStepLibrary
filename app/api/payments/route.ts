import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import { validate, paymentSchema } from "@/lib/validators";

/* ============================
   GET → Fetch payments
============================ */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const filter = studentId ? { student: studentId } : {};

    const payments = await Payment.find(filter)
      .populate("student", "name email phone")
      .sort({ paidAt: -1 });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error("Fetch Payments Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* ============================
   POST → Add payment
============================ */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const data = validate(paymentSchema, body);

    const student = await Student.findById(data.studentId);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 💰 Create payment record
    const payment = await Payment.create({
      student: data.studentId,
      amount: data.amount,
      mode: data.mode,
      transactionId: data.transactionId,
      remarks: data.remarks,
      status: "SUCCESS",
    });

    // 🔄 Update student fees
    student.feesPaid += data.amount;

    if (student.pendingFees > 0) {
      student.pendingFees = Math.max(
        student.pendingFees - data.amount,
        0
      );
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      payment,
    });
  } catch (error: any) {
    console.error("Create Payment Error:", error.message);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
