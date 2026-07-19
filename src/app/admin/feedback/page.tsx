import React from "react";
import { mockReviews } from "@/lib/mockData";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function AdminFeedbackPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Feedback</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor reviews and feedback across all vendors and technicians.</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Ratings</option>
            <option>5 Stars</option>
            <option>4 Stars</option>
            <option>3 Stars & Below</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
            <ClientIcon icon="ph:star-fill" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">4.8</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Average Rating</div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
            <ClientIcon icon="ph:chat-teardrop-text" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">1,245</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Reviews</div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center">
            <ClientIcon icon="ph:warning-circle" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">12</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Needs Attention</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Feedback</h2>
        </div>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">For {review.vendor} • {review.date}</p>
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
              <div className="mt-4 ml-13 flex gap-2">
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors">
                  Respond
                </button>
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  Hide Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
