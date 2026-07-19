"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function CustomerNavbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
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
    <header className="h-16 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between md:justify-end px-4 md:px-6 sticky top-0 z-40 transition-colors">

      {/* Mobile Brand (Hidden on desktop as it's in sidebar) */}
      <div className="md:hidden flex items-center gap-2">
        <Link href="/customer" className="flex items-center gap-2 group">
          <Image
            src="/logo-org.svg"
            alt="Handy Experts"
            width={32}
            height={32}
            className="w-12 h-12 group-hover:scale-105 transition-transform"
          />
        </Link>
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
          <Link href="/customer/notifications" className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-full transition-all hover:shadow-sm">
            <ClientIcon icon="ph:bell" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
          </Link>
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Profile Avatar Desktop Dropdown (On mobile, we can just let it navigate to profile, or keep the dropdown) */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 outline-none">
            <div className="w-8 h-8 rounded-full bg-[#00B4FF] flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent hover:ring-blue-500/30 transition-all">
              CU
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Customer User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">customer@example.com</p>
              </div>
              <div className="p-1">
                <Link
                  href="/customer"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ClientIcon icon="ph:squares-four" className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/customer/profile"
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
