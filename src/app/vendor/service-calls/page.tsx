import { getMyServiceCallsForVendorAction } from "@/actions/servicecall.actions";
import { VendorServiceCallsClient } from "@/components/vendor/VendorServiceCallsClient";

export default async function VendorServiceCallsPage() {
  const res = await getMyServiceCallsForVendorAction();
  return <VendorServiceCallsClient initialCalls={res.success ? res.data ?? [] : []} />;
}
