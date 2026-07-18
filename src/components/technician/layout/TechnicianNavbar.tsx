"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface TechnicianNavbarProps {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export function TechnicianNavbar({ isMobileMenuOpen, setMobileMenuOpen }: TechnicianNavbarProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
              placeholder="Search tasks..." 
              className="w-full bg-slate-100 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-[#1E293B] transition-all"
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
          <Link href="/technician/notifications" className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-full transition-all hover:shadow-sm">
            <ClientIcon icon="ph:bell" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
          </Link>

          {/* Wallet Link */}
          <Link href="/technician/wallet" className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-amber-500 rounded-full transition-all hover:shadow-sm">
            <ClientIcon icon="ph:wallet" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
          </Link>
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 outline-none">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent hover:ring-amber-500/30 transition-all">
              TC
            </div>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Technician User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">tech@handyexperts.com</p>
              </div>
              <div className="p-1">
                <Link 
                  href="/technician" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ClientIcon icon="ph:squares-four" className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/technician/profile" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ClientIcon icon="ph:user" className="w-4 h-4" />
                  Profile
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <ClientIcon icon="ph:sign-out" className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}
