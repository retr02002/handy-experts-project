"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface RevenueTrendPoint {
  date: string; // "MMM D" label, already formatted for the axis
  value: number;
}

interface Props {
  data: RevenueTrendPoint[];
  color?: string;
  valuePrefix?: string;
  height?: number;
}

export function RevenueTrendChartImpl({ data, color = "#00B4FF", valuePrefix = "₹", height = 220 }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const gridColor = isDark ? "#1E293B" : "#E2E8F0";
  const textColor = isDark ? "#64748B" : "#94A3B8";

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        No revenue yet for this period.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: textColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
              border: `1px solid ${gridColor}`,
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: isDark ? "#E2E8F0" : "#0F172A", fontWeight: 600 }}
            formatter={(value) => [`${valuePrefix}${Number(value ?? 0).toFixed(0)}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill="url(#revenueTrendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
