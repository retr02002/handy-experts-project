"use client";

import React, { useState } from "react";
import { CustomerSidebar } from "./CustomerSidebar";
import { CustomerNavbar } from "./CustomerNavbar";
import { CustomerBottomNav } from "./CustomerBottomNav";
import { ChatBot } from "@/components/ui/ChatBot";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-7xl mx-auto flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <CustomerBottomNav />
      <ChatBot />

      {/* Floating Theme Toggle (Mobile Only) */}
      <div className="md:hidden fixed bottom-[150px] right-4 z-[90]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-md border border-slate-200/50 dark:border-slate-700/50 p-0.5">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
