import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function CustomerReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback & Suggestions</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClientIcon icon="ph:star" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">We Value Your Feedback</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Help us improve by leaving a review for your recent service orders or suggesting new features.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          Write a Review
        </button>
      </div>
    </div>
  );
}
