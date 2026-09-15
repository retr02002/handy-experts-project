import Link from "next/link";
import { getAllTechniciansForAdminAction } from "@/actions/admin.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { StarRating } from "@/components/shared/StarRating";

export default async function AdminTechniciansPage() {
  const res = await getAllTechniciansForAdminAction();
  const technicians = res.success && res.data ? res.data : [];

  const onDuty = technicians.filter((t) => t.isOnDuty).length;
  const rated = technicians.filter((t) => t.ratingCount > 0);
  const platformRating =
    rated.length > 0 ? rated.reduce((sum, t) => sum + (t.ratingAvg ?? 0), 0) / rated.length : null;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Technicians</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Every technician on the platform, across all vendors.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Technicians", value: String(technicians.length), icon: "ph:users-three-fill" },
          { label: "On duty now", value: String(onDuty), icon: "ph:broadcast-fill" },
          {
            label: "Jobs completed",
            value: String(technicians.reduce((s, t) => s + t.jobsCompleted, 0)),
            icon: "ph:check-circle-fill",
          },
          {
            label: "Avg rating",
            value: platformRating !== null ? platformRating.toFixed(1) : "—",
            icon: "ph:star-fill",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4"
          >
            <ClientIcon icon={s.icon} className="w-4 h-4 text-blue-500 mb-1.5" />
            <p className="text-lg font-black text-slate-900 dark:text-white truncate">{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
          </div>
        ))}
      </div>

      {technicians.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <ClientIcon icon="ph:users-three" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No technicians registered yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-left">
                  {["Technician", "Vendor", "Skill", "Rating", "Completed", "Active", "Status"].map((h) => (
                    <th key={h} className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {technicians.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 min-w-0">
                      <Link href={`/admin/technicians/${t.id}`} className="block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate hover:underline">{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t.username ?? "no username"} &middot; {t.phone}
                        </p>
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {t.vendorName ?? <span className="text-slate-400">Freelance</span>}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {t.skillCategory}
                      <span className="text-slate-400"> &middot; {t.experienceYears}y</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {t.ratingCount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <StarRating value={t.ratingAvg ?? 0} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {(t.ratingAvg ?? 0).toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400">({t.ratingCount})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No ratings</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">{t.jobsCompleted}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{t.jobsActive}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          t.isOnDuty
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {t.isOnDuty ? "On Duty" : "Off Duty"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
