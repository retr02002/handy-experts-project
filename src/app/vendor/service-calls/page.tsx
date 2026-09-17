import { Suspense } from "react";
import { getMyServiceCallsForVendorAction } from "@/actions/servicecall.actions";
import { VendorServiceCallsClient } from "@/components/vendor/VendorServiceCallsClient";

export default async function VendorServiceCallsPage() {
  const res = await getMyServiceCallsForVendorAction();
  return (
    <Suspense fallback={null}>
      <VendorServiceCallsClient initialCalls={res.success ? res.data ?? [] : []} />
    </Suspense>
  );
}
