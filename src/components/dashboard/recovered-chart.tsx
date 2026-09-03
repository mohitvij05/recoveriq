"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINRCompact } from "@/lib/format";

type Point = { date: string; recovered: number };

export function RecoveredChart({ data }: { data: Point[] }) {
  const chartData = data.map((point) => ({
    ...point,
    label: point.date.slice(5),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(44,39,31,0.9)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#a89882", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#a89882", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => formatINRCompact(value)}
          />
          <Tooltip
            cursor={{ fill: "rgba(224,160,74,0.08)" }}
            contentStyle={{
              background: "#1c1914",
              border: "1px solid #2c271f",
              borderRadius: 8,
              color: "#f4ede4",
            }}
            formatter={(value) => [
              formatINRCompact(Number(value ?? 0)),
              "Recovered",
            ]}
          />
          <Bar dataKey="recovered" fill="#e0a04a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
