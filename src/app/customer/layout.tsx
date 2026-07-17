import React from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Portal</h2>
        <div className="w-8 h-8 rounded-full bg-[#00B4FF] text-white flex items-center justify-center text-sm font-bold">C</div>
      </header>
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
