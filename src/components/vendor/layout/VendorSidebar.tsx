"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface VendorSidebarProps {
  isCollapsed: boolean;
  setCollapsed: (val: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

const navItems = [
  { label: "Dashboard", href: "/vendor", icon: "ph:squares-four" },
  { label: "Live Calls", href: "/vendor/live-calls", icon: "ph:phone-call" },
  { label: "Service Calls", href: "/vendor/service-calls", icon: "ph:wrench" },
  { label: "Bookings", href: "/vendor/bookings", icon: "ph:calendar-check" },
  { label: "Revenue", href: "/vendor/revenue", icon: "ph:chart-line-up" },
  { label: "Reviews", href: "/vendor/reviews", icon: "ph:star" },
  { label: "Profile", href: "/vendor/profile", icon: "ph:user" },
  { label: "Wallet", href: "/vendor/wallet", icon: "ph:wallet" },
];

export function VendorSidebar({ isCollapsed, setCollapsed, isMobileMenuOpen, setMobileMenuOpen }: VendorSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 z-50 flex flex-col 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-16 w-64" : "w-64 md:w-60"}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {(!isCollapsed || isMobileMenuOpen) && (
            <div className="flex items-center justify-start overflow-hidden w-full">
              <img src="/logo-org.svg" alt="Handy Experts" className="h-10 md:h-12 w-auto dark:brightness-0 dark:invert" />
            </div>
          )}
          {isCollapsed && !isMobileMenuOpen && (
            <div className="w-full flex justify-center">
              <img src="/logo-org.svg" alt="Handy Experts" className="h-8 w-auto object-left object-cover dark:brightness-0 dark:invert" style={{ maxWidth: '32px' }} />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!isCollapsed)}
            className={`hidden md:flex absolute -right-3 top-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full p-1 transition-transform z-50 ${isCollapsed ? "rotate-180" : ""
              }`}
          >
            <ClientIcon icon="ph:caret-left-bold" className="w-3 h-3" />
          </button>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
          >
            <ClientIcon icon="ph:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl md:rounded-lg transition-all group ${isActive
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                <ClientIcon
                  icon={isActive ? `${item.icon}-fill` : item.icon}
                  className="w-5 h-5 md:w-5 md:h-5 shrink-0"
                />
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="text-[15px] md:text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {isCollapsed && !isMobileMenuOpen && (
                  // Tooltip on hover when collapsed on desktop
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
