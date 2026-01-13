import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";
import {
  validate,
  registerSchema,
  loginSchema,
} from "@/lib/validators";
import { cookies } from "next/headers";

/**
 * POST → /api/auth
 * body: { type: "register" | "login", ...payload }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, message: "Type is required" },
        { status: 400 }
      );
    }

    /* ======================
        REGISTER
    ====================== */
    if (type === "register") {
      const data = validate(registerSchema, body);

      const existingUser = await User.findOne({
        email: data.email,
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "User already exists" },
          { status: 409 }
        );
      }

      const user = await User.create(data);

      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );
    }

    /* ======================
        LOGIN
    ====================== */
    if (type === "login") {
      const data = validate(loginSchema, body);

      const user = await User.findOne({
        email: data.email,
      }).select("+password");

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isMatch = await user.comparePassword(
        data.password
      );

      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
      });

      /* ======================
          Set Cookie (Next 16)
      ====================== */
      const cookieStore = await cookies();

      cookieStore.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid auth type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Auth Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
