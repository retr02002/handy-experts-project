import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function TechnicianFeedbackPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback & Suggestions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit your feedback to help us improve.</p>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
            <input 
              type="text" 
              placeholder="What is this regarding?" 
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
            <textarea 
              rows={5}
              placeholder="Describe your feedback or suggestion in detail..." 
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <button 
            type="button"
            className="w-full sm:w-auto self-end px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ClientIcon icon="ph:paper-plane-right" className="w-5 h-5" />
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
