"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import StudentCard, {
  Student,
} from "@/components/students/StudentCard";
import Button from "@/components/ui/Button";

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ============================
      Fetch Students
  ============================ */

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setStudents(data.students);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchStudents();
  }, []);

  /* ============================
      Filter
  ============================ */

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      `${s.name} ${s.phone} ${s.email || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  /* ============================
      Delete
  ============================ */

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirm) return;

    try {
      await fetch(`/api/students?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

    fetchStudents();
  } catch (error) {
    alert("Delete failed");
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

return (
  <ProtectedRoute>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">
          Students
        </h1>

        <div className="flex gap-2">
          <input
            placeholder="Search students..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black sm:w-64"
          />

          <Button
            onClick={() =>
              router.push("/dashboard/students/add")
            }
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <p className="text-sm text-gray-500">
          No students found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              onEdit={() =>
                router.push(
                  `/dashboard/students/${student._id}`
                )
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  </ProtectedRoute>
);
}
