import mongoose, { Schema, models, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "MANAGER" | "STAFF";
  isActive: boolean;
  createdAt: Date;
  comparePassword?: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "MANAGER", "STAFF"],
      default: "MANAGER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ============================
   Hash password before save
   (Mongoose v7+ compatible)
============================ */
UserSchema.pre("save", async function () {
  // ✅ NO next() here

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ============================
   Compare password method
============================ */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User =
  models.User || model<IUser>("User", UserSchema);

export default User;
