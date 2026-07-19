"use client";

import React, { useState } from "react";
import { CustomerSidebar } from "./CustomerSidebar";
import { CustomerNavbar } from "./CustomerNavbar";
import { CustomerBottomNav } from "./CustomerBottomNav";

export function CustomerLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex transition-colors pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <CustomerSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        {/* Top Navbar */}
        <CustomerNavbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
}
