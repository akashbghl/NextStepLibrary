"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export interface StudentFormData {
  name: string;
  email?: string;
  phone: string;
  plan: "1_MONTH" | "3_MONTH" | "6_MONTH" | "12_MONTH";
  startDate: string;
  feesPaid: number;
  pendingFees?: number;
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void> | void;
  loading?: boolean;
}

const PLAN_OPTIONS = [
  { label: "1 Month", value: "1_MONTH" },
  { label: "3 Months", value: "3_MONTH" },
  { label: "6 Months", value: "6_MONTH" },
  { label: "12 Months", value: "12_MONTH" },
];

export default function StudentForm({
  initialData,
  onSubmit,
  loading,
}: StudentFormProps) {
  const [form, setForm] = useState<StudentFormData>({
    name: "",
    email: "",
    phone: "",
    plan: "1_MONTH",
    startDate: new Date().toISOString().split("T")[0],
    feesPaid: 0,
    pendingFees: 0,
    ...initialData,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "feesPaid" || name === "pendingFees"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
      />

      <Input
        label="Phone"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        required
      />

      {/* Plan */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Subscription Plan
        </label>
        <select
          name="plan"
          value={form.plan}
          onChange={handleChange}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        >
          {PLAN_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Start Date"
        name="startDate"
        type="date"
        value={form.startDate}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fees Paid"
          name="feesPaid"
          type="number"
          value={form.feesPaid}
          onChange={handleChange}
        />

        <Input
          label="Pending Fees"
          name="pendingFees"
          type="number"
          value={form.pendingFees}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          loading={loading}
        >
          Save Student
        </Button>
      </div>
    </form>
  );
}
