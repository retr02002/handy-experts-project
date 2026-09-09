import React from "react";
import { getMyReviewsAction } from "@/actions/review.actions";
import { ReviewList } from "@/components/shared/ReviewList";

export default async function CustomerReviewsPage() {
  const res = await getMyReviewsAction();
  const reviews = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Reviews</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          The ratings you&apos;ve left for technicians and services.
        </p>
      </div>

      <ReviewList
        reviews={reviews}
        perspective="customer"
        emptyMessage="You haven't rated a job yet. Once a job is completed you can rate it from the order screen."
      />
    </div>
  );
}
