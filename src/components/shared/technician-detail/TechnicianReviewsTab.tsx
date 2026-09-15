import React from "react";
import type { ReviewItem } from "@/actions/review.actions";
import { StarRating } from "@/components/shared/StarRating";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function TechnicianReviewsTab({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center max-w-2xl">
        <p className="text-sm text-slate-400">No customer reviews for this technician yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{r.customerName}</p>
              <p className="text-xs text-slate-400 truncate">{r.itemSummary}</p>
            </div>
            <p className="text-xs text-slate-400 shrink-0">{formatDate(r.createdAt)}</p>
          </div>
          <StarRating value={r.technicianRating} />
          {r.technicianComment && <p className="text-sm text-slate-600 dark:text-slate-300">{r.technicianComment}</p>}
        </div>
      ))}
    </div>
  );
}
