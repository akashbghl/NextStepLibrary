"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RevenueData {
  _id: {
    year: number;
    month: number;
  };
  total: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

function formatMonth(month: number, year: number) {
  const date = new Date(year, month - 1);
  return date.toLocaleString("default", {
    month: "short",
  });
}

export default function RevenueChart({
  data,
}: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    name: formatMonth(item._id.month, item._id.year),
    revenue: item.total,
  }));

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">
        Monthly Revenue
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
