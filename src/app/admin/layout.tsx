import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar stub */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Portal</h2>
        </div>
        <nav className="px-4 py-2 space-y-1">
           <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium">Dashboard</div>
           <div className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-medium cursor-pointer">Users</div>
           <div className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-medium cursor-pointer">Services</div>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
