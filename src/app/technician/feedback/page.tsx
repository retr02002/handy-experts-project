import { getMyTechnicianReviewsAction } from "@/actions/review.actions";
import { ReviewList } from "@/components/shared/ReviewList";

export default async function TechnicianFeedbackPage() {
  const res = await getMyTechnicianReviewsAction();
  const reviews = res.success && res.data ? res.data : [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Feedback</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          How customers rated you and the jobs you completed.
        </p>
      </div>

      <ReviewList
        reviews={reviews}
        perspective="technician"
        emptyMessage="No feedback yet. Customers can rate you once a job is completed."
      />
    </div>
  );
}
