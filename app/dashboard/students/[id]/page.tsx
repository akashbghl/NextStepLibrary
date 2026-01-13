"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import StudentForm, {
  StudentFormData,
} from "@/components/students/StudentForm";
import Button from "@/components/ui/Button";

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [student, setStudent] =
    useState<StudentFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ============================
      Fetch student
  ============================ */

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch("/api/students");
        const data = await res.json();

        if (data.success) {
          const found = data.students.find(
            (s: any) => s._id === id
          );

          if (!found) {
            router.push("/dashboard/students");
            return;
          }

          setStudent({
            name: found.name,
            email: found.email,
            phone: found.phone,
            plan: found.plan,
            startDate: found.startDate
              .split("T")[0],
            feesPaid: found.feesPaid,
            pendingFees: found.pendingFees,
          });
        }
      } catch (error) {
        console.error("Fetch student failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, router]);

  /* ============================
      Update
  ============================ */

  const handleUpdate = async (
    formData: StudentFormData
  ) => {
    setSaving(true);

    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      router.push("/dashboard/students");
    } catch (error) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ============================
      UI
  ============================ */

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <ProtectedRoute>
      <div className="max-w-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            Edit Student
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
            initialData={student}
            onSubmit={handleUpdate}
            loading={saving}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
