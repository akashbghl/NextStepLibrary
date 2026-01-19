import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { requireAuth } from "@/lib/requireAuth";
import bcrypt from "bcryptjs";

/* =====================================
   GET → Fetch Settings
===================================== */
export async function GET() {
  try {
    await connectDB();
    const auth = await requireAuth();

    const user = await User.findById(auth.userId).select(
      "name email role"
    );

    const organization = await Organization.findById(
      auth.organizationId
    ).select("name logo");

    if (!user || !organization) {
      throw new Error("Settings not found");
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      organization: {
        name: organization.name,
        logo: organization.logo,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
}

/* =====================================
   PUT → Update Profile / Organization
===================================== */
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAuth();

    const body = await req.json();
    const {
      name,
      organizationName,
      organizationLogo,
    } = body;

    if (name) {
      await User.findByIdAndUpdate(auth.userId, {
        name,
      });
    }

    if (organizationName || organizationLogo) {
      await Organization.findByIdAndUpdate(
        auth.organizationId,
        {
          ...(organizationName && { name: organizationName }),
          ...(organizationLogo && { logo: organizationLogo }),
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

/* =====================================
   PATCH → Change Password
===================================== */
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAuth();

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      throw new Error("Both passwords required");
    }

    const user = await User.findById(auth.userId).select(
      "+password"
    );

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      throw new Error("Old password incorrect");
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
