import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { TabDef } from "@/components/shared/TabShell";
import { getVendorTechnicianByIdAction } from "@/actions/technician.actions";
import { getReviewsForTechnicianAction } from "@/actions/review.actions";
import { TechnicianDetailTabs } from "@/components/vendor/technician-detail/TechnicianDetailTabs";

export default async function VendorTechnicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [technicianRes, reviewsRes] = await Promise.all([
    getVendorTechnicianByIdAction(id),
    getReviewsForTechnicianAction(id),
  ]);

  if (!technicianRes.success || !technicianRes.data) notFound();
  const technician = technicianRes.data;
  const reviews = reviewsRes.success ? reviewsRes.data ?? [] : [];

  const header = (
    <div className="flex items-start gap-3">
      <Link
        href="/vendor/technicians"
        className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
      >
        <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{technician.name}</h1>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              technician.isOnDuty
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {technician.isOnDuty ? "On Duty" : "Off Duty"}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
          {technician.skillCategory} · {technician.experienceYears}y experience · {technician.phone}
        </p>
      </div>
    </div>
  );

  const tabs: Omit<TabDef, "content">[] = [
    { id: "info", label: "Info", icon: "ph:identification-card-bold" },
    { id: "reviews", label: "Reviews", icon: "ph:star-bold", badge: technician.ratingCount > 0 ? technician.ratingCount : undefined },
    { id: "tracking", label: "Tracking", icon: "ph:map-trifold-bold" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <TechnicianDetailTabs header={header} tabDefs={tabs} technician={technician} reviews={reviews} />
    </div>
  );
}
