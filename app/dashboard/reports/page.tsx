"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/ui/Button";

interface Payment {
  _id: string;
  amount: number;
  mode: string;
  paidAt: string;
  student?: {
    name: string;
  };
}

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ============================
      Fetch Payments
  ============================ */

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();

      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error("Fetch payments failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ============================
      Filter Logic
  ============================ */

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const paidDate = new Date(p.paidAt).getTime();

      if (fromDate) {
        const from = new Date(fromDate).getTime();
        if (paidDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate).getTime();
        if (paidDate > to) return false;
      }

      return true;
    });
  }, [payments, fromDate, toDate]);

  const totalAmount = filteredPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  /* ============================
      Export CSV
  ============================ */

  const exportCSV = () => {
    if (filteredPayments.length === 0) return;

    const headers = [
      "Student",
      "Amount",
      "Mode",
      "Date",
    ];

    const rows = filteredPayments.map((p) => [
      p.student?.name || "-",
      p.amount,
      p.mode,
      new Date(p.paidAt).toLocaleDateString(),
    ]);

    const csvContent =
      [headers, ...rows]
        .map((e) => e.join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "payments-report.csv";
    link.click();

    URL.revokeObjectURL(url);
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">
            Reports
          </h1>

          <Button onClick={exportCSV}>
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
          <div>
            <label className="text-xs text-gray-500">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
              className="rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
              className="rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <div className="ml-auto text-sm">
            <span className="text-gray-500">
              Total Collection:
            </span>{" "}
            <b>₹{totalAmount}</b>
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
                    {p.student?.name || "-"}
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
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
