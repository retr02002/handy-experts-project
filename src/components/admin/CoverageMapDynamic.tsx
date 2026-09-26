"use client";

import dynamic from "next/dynamic";

export const CoverageMap = dynamic(
  () => import("@/components/admin/CoverageMap").then((mod) => mod.CoverageMap),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" /> }
);
