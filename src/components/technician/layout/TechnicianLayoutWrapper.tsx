"use client";

import React, { useState, useEffect } from "react";
import { TechnicianSidebar } from "./TechnicianSidebar";
import { TechnicianNavbar } from "./TechnicianNavbar";

export function TechnicianLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Allow theme toggle in technician panel
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex transition-colors">
      {/* Sidebar */}
      <TechnicianSidebar 
        isCollapsed={isSidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-60"
        }`}
      >
        <TechnicianNavbar 
          isMobileMenuOpen={isMobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full max-w-7xl mx-auto flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
