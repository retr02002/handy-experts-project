"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface StatusBreakdownSlice {
  label: string;
  count: number;
  color: string;
}

interface Props {
  data: StatusBreakdownSlice[];
  height?: number;
}

export function StatusBreakdownChartImpl({ data, height = 220 }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const slices = data.filter((d) => d.count > 0);
  const total = slices.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        No jobs yet for this period.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="count"
            nameKey="label"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {slices.map((s, idx) => (
              <Cell key={idx} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
              border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: isDark ? "#E2E8F0" : "#0F172A", fontWeight: 600 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: isDark ? "#94A3B8" : "#64748B" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
