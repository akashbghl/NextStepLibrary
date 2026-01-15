import mongoose, { Schema, models, model } from "mongoose";

export interface IStudent {
  name: string;
  email: string;
  phone: string;
  plan: "1_MONTH" | "3_MONTH" | "6_MONTH" | "12_MONTH";
  startDate: Date;
  expiryDate: Date;
  feesPaid: number;
  pendingFees: number;
  status: "ACTIVE" | "EXPIRED";
  organizationId: mongoose.Types.ObjectId;   // ✅ Added
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    plan: {
      type: String,
      enum: ["1_MONTH", "3_MONTH", "6_MONTH", "12_MONTH"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },

    feesPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingFees: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE",
    },

    /* ===========================
        Organization Reference
    ============================ */
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Auto update status before saving
 */
StudentSchema.pre("save", function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (this.expiryDate < today) {
    this.status = "EXPIRED";
  } else {
    this.status = "ACTIVE";
  }
});

/* ===========================
    Compound Index
=========================== */
StudentSchema.index({
  organizationId: 1,
  expiryDate: 1,
});

const Student =
  models.Student || model<IStudent>("Student", StudentSchema);

export default Student;
