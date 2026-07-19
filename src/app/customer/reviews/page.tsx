import React from "react";
import { mockReviews } from "@/lib/mockData";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function CustomerReviewsPage() {
  const customerName = "Alice Smith";
  const myReviews = mockReviews.filter(r => r.customer === customerName);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Reviews</h1>
      </div>
      
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {myReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Service by {review.vendor}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{review.date}</p>
                </div>
                <div className="flex gap-1 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-lg">
                  {[...Array(5)].map((_, i) => (
                    <ClientIcon 
                      key={i} 
                      icon={i < review.rating ? "ph:star-fill" : "ph:star"} 
                      className={`w-4 h-4 ${i < review.rating ? "text-amber-500" : "text-slate-300 dark:text-slate-600"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-4 text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                &quot;{review.comment}&quot;
              </p>
              <div className="mt-4 flex gap-2">
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  Edit Review
                </button>
              </div>
            </div>
          ))}
          
          {myReviews.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              You haven&apos;t left any reviews yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
