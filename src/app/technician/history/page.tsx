import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getMyServiceCallsForTechnicianAction } from "@/actions/servicecall.actions";
import { getMyTechnicianStatsAction } from "@/actions/technician.actions";
import { StarRating } from "@/components/shared/StarRating";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TechnicianHistoryPage() {
  const [callsRes, statsRes] = await Promise.all([
    getMyServiceCallsForTechnicianAction(),
    getMyTechnicianStatsAction(),
  ]);

  const calls = callsRes.success && callsRes.data ? callsRes.data : [];
  const stats = statsRes.success ? statsRes.data : undefined;
  const completed = calls
    .filter((c) => c.status === "COMPLETED")
    .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Every job you&apos;ve completed, and how customers rated you.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Jobs completed", value: String(stats?.jobsCompleted ?? 0), icon: "ph:check-circle-fill" },
          { label: "Active now", value: String(stats?.jobsActive ?? 0), icon: "ph:wrench-fill" },
          { label: "Lifetime value", value: `₹${(stats?.lifetimeValue ?? 0).toFixed(0)}`, icon: "ph:currency-inr" },
          {
            label: stats?.ratingCount ? `Rating (${stats.ratingCount})` : "Rating",
            value: stats?.ratingCount ? (stats.ratingAvg ?? 0).toFixed(1) : "—",
            icon: "ph:star-fill",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4"
          >
            <ClientIcon icon={s.icon} className="w-4 h-4 text-amber-500 mb-1.5" />
            <p className="text-lg font-black text-slate-900 dark:text-white truncate">{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
          </div>
        ))}
      </div>

      {stats && stats.ratingCount > 0 && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(stats.ratingAvg ?? 0).toFixed(1)}
            </span>
            <StarRating value={stats.ratingAvg ?? 0} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              From {stats.ratingCount} customer{stats.ratingCount === 1 ? "" : "s"}.
            </p>
          </div>
          <Link href="/technician/feedback" className="text-xs font-bold text-amber-600 hover:underline shrink-0">
            Read reviews
          </Link>
        </div>
      )}

      {completed.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <ClientIcon icon="ph:clock-counter-clockwise" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white">No completed jobs yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Finished jobs will appear here with what you earned on each.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {completed.map((call) => (
            <div key={call.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ClientIcon icon="ph:check-bold" className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{call.itemSummary}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {call.customerName} &middot; {call.city}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{formatDate(call.completedAt)}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">₹{call.total.toFixed(0)}</p>
                {call.hasReport && <p className="text-[10px] text-slate-400 mt-0.5">Report filed</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
