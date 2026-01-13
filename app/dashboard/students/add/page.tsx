"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import StudentForm, {
  StudentFormData,
} from "@/components/students/StudentForm";
import Button from "@/components/ui/Button";

export default function AddStudentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleCreateStudent = async (
    formData: StudentFormData
  ) => {
    setSaving(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      router.push("/dashboard/students");
    } catch (error) {
      alert("Failed to create student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            Add Student
          </h1>

          <Button
            variant="outline"
            onClick={() =>
              router.push("/dashboard/students")
            }
          >
            Back
          </Button>
        </div>

        {/* Form */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <StudentForm
            onSubmit={handleCreateStudent}
            loading={saving}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
