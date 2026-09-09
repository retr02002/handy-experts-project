import { getMyServiceCallsForTechnicianAction, getMyAvailableJobsAction } from "@/actions/servicecall.actions";
import { TechnicianServiceCallsClient } from "@/components/technician/TechnicianServiceCallsClient";

export default async function TechnicianServiceCallsPage() {
  const [callsRes, jobsRes] = await Promise.all([
    getMyServiceCallsForTechnicianAction(),
    getMyAvailableJobsAction(),
  ]);

  return (
    <TechnicianServiceCallsClient
      initialCalls={callsRes.success ? callsRes.data ?? [] : []}
      initialAvailableJobs={jobsRes.success ? jobsRes.data ?? [] : []}
    />
  );
}
