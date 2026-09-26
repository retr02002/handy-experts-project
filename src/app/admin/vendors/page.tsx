import React, { Suspense } from "react";
import { getAllVendorsForAdminAction } from "@/actions/admin.actions";
import { VendorsClient } from "./VendorsClient";

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading vendors...</div>}>
      <VendorsLoader />
    </Suspense>
  );
}

async function VendorsLoader() {
  const res = await getAllVendorsForAdminAction();
  if (!res.success || !res.data) {
    return <div className="p-8 text-center text-red-500 text-sm">Failed to load vendors</div>;
  }

  return <VendorsClient initialVendors={res.data} />;
}
