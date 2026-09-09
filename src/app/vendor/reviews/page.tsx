import { getReviewsForVendorAction } from "@/actions/review.actions";
import { ReviewList } from "@/components/shared/ReviewList";

export default async function VendorReviewsPage() {
  const res = await getReviewsForVendorAction();
  const reviews = res.success && res.data ? res.data : [];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Reviews</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          What customers said about your technicians and the services they booked.
        </p>
      </div>

      <ReviewList
        reviews={reviews}
        perspective="vendor"
        emptyMessage="No reviews yet. They appear here as soon as a customer rates a completed job."
      />
    </div>
  );
}
