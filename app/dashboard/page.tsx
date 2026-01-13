"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import RevenueChart from "@/components/charts/RevenueChart";
import Button from "@/components/ui/Button";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  expiredStudents: number;
  totalRevenue: number;
  todayAttendance: number;
}

interface ExpiringStudent {
  _id: string;
  name: string;
  phone: string;
  expiryDate: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(
    null
  );
  const [monthlyRevenue, setMonthlyRevenue] = useState<
    any[]
  >([]);
  const [expiringSoon, setExpiringSoon] = useState<
    ExpiringStudent[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ============================
      Fetch Dashboard
  ============================ */

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/dashboard");
      const data = await res.json();

      if (!data.success) {
        throw new Error("Failed to load dashboard");
      }

      setStats(data.stats);
      setMonthlyRevenue(data.monthlyRevenue);
      setExpiringSoon(data.expiringSoon);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ============================
      UI States
  ============================ */

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDashboard}>
            Retry
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  if (!stats) return null;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            Dashboard
          </h1>

          <Button
            variant="outline"
            onClick={fetchDashboard}
          >
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
          />
          <StatCard
            label="Active Students"
            value={stats.activeStudents}
          />
          <StatCard
            label="Expired Students"
            value={stats.expiredStudents}
          />
          <StatCard
            label="Total Revenue"
            value={`₹${stats.totalRevenue}`}
          />
          <StatCard
            label="Today's Attendance"
            value={stats.todayAttendance}
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <RevenueChart data={monthlyRevenue} />
          </div>

          {/* Expiring Soon */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">
              Expiring Soon
            </h3>

            {expiringSoon.length === 0 ? (
              <p className="text-xs text-gray-500">
                No upcoming expiries 🎉
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {expiringSoon.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center justify-between border-b pb-1 last:border-none"
                  >
                    <div>
                      <p className="font-medium">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.phone}
                      </p>
                    </div>
                    <span className="text-xs text-orange-600">
                      {new Date(
                        s.expiryDate
                      ).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* ============================
   Components
============================ */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
  );
}
