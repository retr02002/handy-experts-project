import React, { Suspense } from "react";
import { getAllServiceCallsAction } from "@/actions/servicecall.actions";
import { ServiceCallsClient } from "./ServiceCallsClient";

export default function ServiceCallsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading service calls...</div>}>
      <ServiceCallsLoader />
    </Suspense>
  );
}

async function ServiceCallsLoader() {
  const res = await getAllServiceCallsAction();
  if (!res.success || !res.data) {
    return <div className="p-8 text-center text-red-500 text-sm">Failed to load service calls</div>;
  }

  return <ServiceCallsClient initialData={res.data} />;
}

