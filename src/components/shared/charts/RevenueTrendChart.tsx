"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { RevenueTrendPoint } from "./RevenueTrendChartImpl";

export type { RevenueTrendPoint } from "./RevenueTrendChartImpl";

/**
 * Thin client shell so recharts (~100KB+) is fetched only when a chart
 * actually renders, instead of riding along in the first-load bundle of
 * every dashboard that happens to show one. The shell exists because the
 * pages importing this are Server Components, where `ssr: false` isn't
 * allowed — it has to be declared from inside a client boundary.
 */
const Impl = dynamic(() => import("./RevenueTrendChartImpl").then((m) => m.RevenueTrendChartImpl), {
  ssr: false,
  loading: () => <div className="w-full h-[220px] bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />,
});

interface Props {
  data: RevenueTrendPoint[];
  color?: string;
  valuePrefix?: string;
  height?: number;
}

export function RevenueTrendChart(props: Props) {
  return <Impl {...props} />;
}
