import React from "react";
import type { ReviewItem } from "@/actions/review.actions";
import { StarRating } from "@/components/shared/StarRating";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function VendorReviewsTab({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center w-full">
        <p className="text-sm text-slate-400">No customer reviews for this vendor yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{r.customerName}</p>
              <p className="text-xs text-slate-400 truncate">{r.itemSummary}{r.technicianName ? ` · ${r.technicianName}` : ""}</p>
            </div>
            <p className="text-[11px] text-slate-400 shrink-0">{formatDate(r.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Service</span>
              <StarRating value={r.serviceRating} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tech</span>
              <StarRating value={r.technicianRating} />
            </div>
          </div>
          {(r.serviceComment || r.technicianComment) && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{r.serviceComment || r.technicianComment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
