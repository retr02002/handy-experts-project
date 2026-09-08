"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface TechnicianSidebarProps {
  isCollapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const navItems = [
  { label: "Dashboard", href: "/technician", icon: "ph:squares-four" },
  { label: "Service Calls", href: "/technician/service-calls", icon: "ph:wrench" },
  { label: "Service Areas", href: "/technician/service-areas", icon: "ph:map-pin-area" },
  { label: "Wallet", href: "/technician/wallet", icon: "ph:wallet" },
  { label: "Feedback", href: "/technician/feedback", icon: "ph:star" },
  { label: "Referral Code", href: "/technician/referral", icon: "ph:users-three" },
  { label: "Profile", href: "/technician/profile", icon: "ph:user" },
];

export function TechnicianSidebar({ isCollapsed, setCollapsed }: TechnicianSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center justify-start overflow-hidden w-full">
            <img src="/logo-org.svg" alt="Handyzo" className="h-10 md:h-12 w-auto dark:brightness-0 dark:invert" />
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <img
              src="/logo-org.svg"
              alt="Handyzo"
              className="h-8 w-auto object-left object-cover dark:brightness-0 dark:invert"
              style={{ maxWidth: "32px" }}
            />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className={`hidden md:flex absolute -right-3 top-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full p-1 transition-transform z-50 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        >
          <ClientIcon icon="ph:caret-left-bold" className="w-3 h-3" />
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
              className={`flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl md:rounded-lg transition-all group relative ${
                isActive
                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ClientIcon icon={isActive ? `${item.icon}-fill` : item.icon} className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
