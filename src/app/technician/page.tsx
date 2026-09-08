import { getMyServiceCallsForTechnicianAction } from "@/actions/servicecall.actions";
import { getMyDutyStatusAction } from "@/actions/technician.actions";
import { TechnicianDashboardClient } from "@/components/technician/TechnicianDashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function TechnicianDashboardPage() {
  const session = await getServerSession(authOptions);
  const fullName = session?.user?.name || "Technician";
  const [callsRes, dutyRes] = await Promise.all([getMyServiceCallsForTechnicianAction(), getMyDutyStatusAction()]);

  return (
    <TechnicianDashboardClient
      initialCalls={callsRes.success ? callsRes.data ?? [] : []}
      initialIsOnDuty={dutyRes.success ? dutyRes.data?.isOnDuty ?? false : false}
      technicianName={fullName}
    />
  );
}
