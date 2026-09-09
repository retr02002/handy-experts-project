import { getAllReviewsAction } from "@/actions/review.actions";
import { ReviewList } from "@/components/shared/ReviewList";

export default async function AdminFeedbackPage() {
  const res = await getAllReviewsAction();
  const reviews = res.success && res.data ? res.data : [];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Feedback</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Every rating customers have left, across all vendors and technicians.
        </p>
      </div>

      <ReviewList
        reviews={reviews}
        perspective="vendor"
        emptyMessage="No reviews on the platform yet."
      />
    </div>
  );
}
