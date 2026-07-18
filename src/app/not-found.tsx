import React from "react";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { ClientIcon } from "@/components/ui/ClientIcon";

export const metadata = {
  title: "404 - Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020813] flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#00B4FF]/10 dark:bg-[#00B4FF]/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <div className="w-24 h-24 mb-8 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <ClientIcon icon="ph:warning-circle-duotone" className="w-12 h-12 text-[#00B4FF]" />
        </div>
        
        <h1 className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
          404
        </h1>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6 tracking-tight">
          Oops! Page not found
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-lg">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00B4FF] text-white font-bold hover:bg-[#0070FF] transition-colors shadow-[0_8px_20px_-6px_rgba(0,180,255,0.4)] flex items-center justify-center gap-2"
          >
            <ClientIcon icon="ph:house-bold" className="w-5 h-5" />
            Back to Home
          </Link>
          
          <BackButton
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/50 flex items-center justify-center gap-2"
          >
            <ClientIcon icon="ph:arrow-u-up-left-bold" className="w-5 h-5" />
            Go Back
          </BackButton>
        </div>
      </div>
    </div>
  );
}
