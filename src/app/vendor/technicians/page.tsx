import React, { Suspense } from "react";
import { getMyTechniciansAction } from "@/actions/technician.actions";
import { TechniciansClient } from "./TechniciansClient";

export default function VendorTechniciansPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading technicians...</div>}>
      <TechniciansLoader />
    </Suspense>
  );
}

async function TechniciansLoader() {
  const res = await getMyTechniciansAction();
  if (!res.success || !res.data) {
    return <div className="p-8 text-center text-red-500 text-sm">Failed to load technicians</div>;
  }

  return <TechniciansClient initialTechnicians={res.data} />;
}

