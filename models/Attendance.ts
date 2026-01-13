import mongoose, { Schema, models, model } from "mongoose";

export interface IAttendance {
  student: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  source: "MANUAL" | "QR" | "AUTO";
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    checkIn: {
      type: Date,
      required: true,
      default: Date.now,
    },

    checkOut: {
      type: Date,
    },

    source: {
      type: String,
      enum: ["MANUAL", "QR", "AUTO"],
      default: "MANUAL",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate attendance per student per day
 */
AttendanceSchema.index(
  { student: 1, date: 1 },
  { unique: true }
);

const Attendance =
  models.Attendance ||
  model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
