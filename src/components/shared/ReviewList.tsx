import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { StarRating } from "./StarRating";
import type { ReviewItem } from "@/actions/review.actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

/**
 * One rendering of a customer's verdict, reused by the customer's own list,
 * the vendor's inbox and the technician's feedback page. The perspective only
 * changes whose name leads the card — the ratings themselves are the same
 * numbers everywhere, which is the point of storing them once.
 */
export function ReviewList({
  reviews,
  perspective,
  emptyMessage,
}: {
  reviews: ReviewItem[];
  perspective: "customer" | "vendor" | "technician";
  emptyMessage: string;
}) {
  const technicianAvg = average(reviews.map((r) => r.technicianRating));
  const serviceAvg = average(reviews.map((r) => r.serviceRating));

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
        <ClientIcon icon="ph:star-bold" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {perspective === "technician" ? "Your rating" : "Technician rating"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {technicianAvg?.toFixed(1) ?? "—"}
            </span>
            <StarRating value={technicianAvg ?? 0} />
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service rating</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">{serviceAvg?.toFixed(1) ?? "—"}</span>
            <StarRating value={serviceAvg ?? 0} />
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviews</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1.5">{reviews.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {reviews.map((r) => {
          const heading =
            perspective === "customer" ? r.technicianName ?? "Your technician" : r.customerName;
          const subheading =
            perspective === "vendor" && r.technicianName ? `Technician: ${r.technicianName}` : r.itemSummary;

          return (
            <div key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    {heading.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{heading}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subheading}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 shrink-0">{formatDate(r.createdAt)}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technician</span>
                    <StarRating value={r.technicianRating} />
                  </div>
                  {r.technicianComment && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 break-words">
                      &quot;{r.technicianComment}&quot;
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service</span>
                    <StarRating value={r.serviceRating} />
                  </div>
                  {r.serviceComment && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 break-words">
                      &quot;{r.serviceComment}&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
