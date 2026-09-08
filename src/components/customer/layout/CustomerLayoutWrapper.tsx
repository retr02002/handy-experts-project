"use client";

import React, { useState } from "react";
import { CustomerSidebar } from "./CustomerSidebar";
import { CustomerNavbar } from "./CustomerNavbar";
import { CustomerBottomNav } from "./CustomerBottomNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { usePathname } from "next/navigation";

export function CustomerLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isServicesPage = pathname === "/customer/services";

  return (
    <div className={`bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex transition-colors pb-[104px] md:pb-0 ${isServicesPage ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      {/* Desktop Sidebar */}
      <CustomerSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        {/* Top Navbar */}
        <CustomerNavbar />
        
        {/* Page Content */}
        <main className={`flex-1 flex flex-col w-full ${isServicesPage ? 'overflow-hidden' : 'p-4 md:p-6 max-w-7xl mx-auto'}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <CustomerBottomNav />

    </div>
  );
}
