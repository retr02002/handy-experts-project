import React from "react";
import { mockReviews } from "@/lib/mockData";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function VendorReviewsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Reviews</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">See what customers are saying about your technicians.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mockReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                    {review.customer.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{review.customer}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <ClientIcon 
                      key={i} 
                      icon={i < review.rating ? "ph:star-fill" : "ph:star"} 
                      className={`w-4 h-4 ${i < review.rating ? "text-amber-500" : "text-slate-300 dark:text-slate-600"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-3 text-sm ml-13">
                &quot;{review.comment}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
