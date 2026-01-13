"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/ui/Button";

interface Student {
  _id: string;
  name: string;
}

interface Attendance {
  _id: string;
  student: Student;
  checkIn: string;
  checkOut?: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState("");

  /* ============================
      Fetch Data
  ============================ */

  const fetchData = async () => {
    try {
      const [attendanceRes, studentsRes] =
        await Promise.all([
          fetch("/api/attendance"),
          fetch("/api/students"),
        ]);

      const attendanceData =
        await attendanceRes.json();
      const studentsData = await studentsRes.json();

      if (attendanceData.success) {
        setRecords(attendanceData.records);
      }

      if (studentsData.success) {
        setStudents(studentsData.students);
      }
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ============================
      Check In
  ============================ */

  const handleCheckIn = async () => {
    if (!studentId) return alert("Select student");

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          source: "MANUAL",
        }),
      });

      fetchData();
    } catch (error) {
      alert("Check-in failed");
    }
  };

  /* ============================
      Check Out
  ============================ */

  const handleCheckOut = async (id: string) => {
    try {
      await fetch("/api/attendance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceId: id,
        }),
      });

      fetchData();
    } catch (error) {
      alert("Check-out failed");
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
        <h1 className="text-lg font-semibold">
          Attendance
        </h1>

        {/* Check In */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
          <select
            value={studentId}
            onChange={(e) =>
              setStudentId(e.target.value)
            }
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">
              Select student
            </option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <Button onClick={handleCheckIn}>
            Check In
          </Button>
        </div>

        {/* Records */}
        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  Student
                </th>
                <th className="px-3 py-2 text-left">
                  Check In
                </th>
                <th className="px-3 py-2 text-left">
                  Check Out
                </th>
                <th className="px-3 py-2 text-left">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r._id}
                  className="border-b last:border-none"
                >
                  <td className="px-3 py-2">
                    {r.student?.name}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(
                      r.checkIn
                    ).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2">
                    {r.checkOut
                      ? new Date(
                          r.checkOut
                        ).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {!r.checkOut && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleCheckOut(r._id)
                        }
                      >
                        Check Out
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
