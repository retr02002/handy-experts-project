"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { UserDropdown } from "@/components/shared/UserDropdown";

interface AdminNavbarProps {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export function AdminNavbar({ isMobileMenuOpen, setMobileMenuOpen }: AdminNavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 transition-colors">
      
      <div className="flex items-center gap-2 md:gap-0 flex-1">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
        >
          <ClientIcon icon="ph:list" className="w-6 h-6" />
        </button>

        {/* Left: Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative group">
            <ClientIcon icon="ph:magnifying-glass" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-slate-100 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#00B4FF] focus:bg-white dark:focus:bg-[#1E293B] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Actions Container Pill */}
        <div className="flex items-center gap-0.5 md:gap-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
          
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} 
            className="p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-full transition-all hover:shadow-sm"
          >
            {mounted && resolvedTheme === "dark" ? (
              <ClientIcon icon="ph:moon" className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <ClientIcon icon="ph:sun-dim" className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>

          {/* Notifications */}
          <Link href="/admin/notifications" className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-full transition-all hover:shadow-sm">
            <ClientIcon icon="ph:bell" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
          </Link>

          {/* Wallet */}
          <Link href="/admin/wallet" className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-[#00B4FF] rounded-full transition-all hover:shadow-sm">
            <ClientIcon icon="ph:wallet" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
          </Link>
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Profile Avatar */}
        <UserDropdown />
        
      </div>
    </header>
  );
}
