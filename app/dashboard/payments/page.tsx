"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface Student {
  _id: string;
  name: string;
}

interface Payment {
  _id: string;
  amount: number;
  mode: string;
  paidAt: string;
  student: Student;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    studentId: "",
    amount: 0,
    mode: "CASH",
  });

  /* ============================
      Fetch Data
  ============================ */

  const fetchData = async () => {
    try {
      const [paymentsRes, studentsRes] = await Promise.all([
        fetch("/api/payments", { credentials: "include" }),
        fetch("/api/students", { credentials: "include" }),
      ]);

      const paymentsData = await paymentsRes.json();
      const studentsData = await studentsRes.json();

      if (paymentsData.success) {
        setPayments(paymentsData.payments);
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
      Create Payment
  ============================ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setOpen(false);
      setForm({
        studentId: "",
        amount: 0,
        mode: "CASH",
      });
      fetchData();
    } catch (error) {
      alert("Payment failed");
    } finally {
      setSaving(false);
    }
  };

  /* ============================
      Filter
  ============================ */

  const filteredPayments = useMemo(() => {
    return payments.filter((p) =>
      `${p.student?.name} ${p.mode} ${p.amount}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [payments, search]);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">
            Payments
          </h1>

          <div className="flex gap-2">
            <input
              placeholder="Search payments..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />

            <Button onClick={() => setOpen(true)}>
              Add Payment
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  Student
                </th>
                <th className="px-3 py-2 text-left">
                  Amount
                </th>
                <th className="px-3 py-2 text-left">
                  Mode
                </th>
                <th className="px-3 py-2 text-left">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr
                  key={p._id}
                  className="border-b last:border-none"
                >
                  <td className="px-3 py-2">
                    {p.student?.name}
                  </td>
                  <td className="px-3 py-2">
                    ₹{p.amount}
                  </td>
                  <td className="px-3 py-2">
                    {p.mode}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(
                      p.paidAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Add Payment"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Student */}
            <div>
              <label className="text-sm font-medium">
                Student
              </label>
              <select
                value={form.studentId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    studentId: e.target.value,
                  }))
                }
                required
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">
                  Select student
                </option>
                {students.map((s) => (
                  <option
                    key={s._id}
                    value={s._id}
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
              required
            />

            {/* Mode */}
            <div>
              <label className="text-sm font-medium">
                Payment Mode
              </label>
              <select
                value={form.mode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mode: e.target.value,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="CASH">
                  Cash
                </option>
                <option value="UPI">UPI</option>
                <option value="CARD">
                  Card
                </option>
                <option value="NETBANKING">
                  Net Banking
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={saving}
              >
                Save
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
