import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { TabDef } from "@/components/shared/TabShell";
import { getAdminTechnicianByIdAction } from "@/actions/technician.actions";
import { getReviewsForTechnicianAction } from "@/actions/review.actions";
import { getTechnicianDocumentsForAdminOrVendorAction } from "@/actions/kyc.actions";
import { AdminTechnicianDetailTabs } from "@/components/admin/technician-detail/AdminTechnicianDetailTabs";

export default async function AdminTechnicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [technicianRes, reviewsRes, documentsRes] = await Promise.all([
    getAdminTechnicianByIdAction(id),
    getReviewsForTechnicianAction(id),
    getTechnicianDocumentsForAdminOrVendorAction(id),
  ]);

  if (!technicianRes.success || !technicianRes.data) notFound();
  const technician = technicianRes.data;
  const reviews = reviewsRes.success ? reviewsRes.data ?? [] : [];
  const documents = documentsRes.success ? documentsRes.data ?? [] : [];

  const header = (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/technicians"
          className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#00B4FF] to-blue-600 text-white flex items-center justify-center text-lg sm:text-xl font-black shrink-0">
            {technician.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{technician.name}</h1>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  technician.isOnDuty
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {technician.isOnDuty ? "On Duty" : "Off Duty"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {technician.vendorName ?? "Freelance"} · {technician.username ?? "no username"} · {technician.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs: Omit<TabDef, "content">[] = [
    { id: "info", label: "Info", icon: "ph:identification-card-bold" },
    { id: "reviews", label: "Reviews", icon: "ph:star-bold", badge: technician.ratingCount > 0 ? technician.ratingCount : undefined },
    { id: "tracking", label: "Tracking", icon: "ph:map-trifold-bold" },
    { id: "documents", label: "Documents", icon: "ph:folder-lock" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminTechnicianDetailTabs header={header} tabDefs={tabs} technician={technician} reviews={reviews} documents={documents} />
    </div>
  );
}
