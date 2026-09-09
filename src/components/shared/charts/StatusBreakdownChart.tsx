"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { StatusBreakdownSlice } from "./StatusBreakdownChartImpl";

export type { StatusBreakdownSlice } from "./StatusBreakdownChartImpl";

/** Same lazy-shell pattern as RevenueTrendChart — see the note there. */
const Impl = dynamic(() => import("./StatusBreakdownChartImpl").then((m) => m.StatusBreakdownChartImpl), {
  ssr: false,
  loading: () => <div className="w-full h-[220px] bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />,
});

interface Props {
  data: StatusBreakdownSlice[];
  height?: number;
}

export function StatusBreakdownChart(props: Props) {
  return <Impl {...props} />;
}
