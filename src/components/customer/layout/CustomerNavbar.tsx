"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { useCart } from "@/context/CartContext";

export function CustomerNavbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 transition-colors">
      
      {/* Left: Logo & Location Picker */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        <LocationPicker />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {/* Actions Container Pill */}
        <div className="flex items-center gap-0.5 md:gap-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hidden sm:block p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-full transition-all hover:shadow-sm"
          >
            {mounted && resolvedTheme === "dark" ? (
              <ClientIcon icon="ph:moon" className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <ClientIcon icon="ph:sun-dim" className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-full transition-all hover:shadow-sm">
            <ClientIcon icon="ph:shopping-cart" className="w-4 h-4 md:w-5 md:h-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 md:top-0 md:right-0 bg-[#00B4FF] text-white text-[9px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-slate-100/80 dark:ring-slate-800/80 animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link href="/customer/notifications" className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-full transition-all hover:shadow-sm">
            <ClientIcon icon="ph:bell" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
          </Link>
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Profile Avatar Desktop Dropdown (On mobile, we can just let it navigate to profile, or keep the dropdown) */}
        <UserDropdown />

      </div>
    </header>
  );
}
