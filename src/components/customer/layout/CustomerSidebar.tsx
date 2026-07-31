"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

const SIDEBAR_LINKS = [
  { href: "/customer", label: "Dashboard", icon: "ph:squares-four" },
  { href: "/customer/orders", label: "Orders", icon: "ph:shopping-cart" },
  { href: "/customer/bills", label: "Bills", icon: "ph:receipt" },
  { href: "/customer/rewards", label: "Rewards", icon: "ph:gift" },
  { href: "/customer/referrals", label: "Referrals", icon: "ph:users" },
  { href: "/customer/reviews", label: "Reviews", icon: "ph:star" },
  { href: "/customer/profile", label: "Profile", icon: "ph:user" },
];

interface CustomerSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function CustomerSidebar({ isCollapsed, setIsCollapsed }: CustomerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <Link href="/" className="flex items-center justify-start overflow-hidden w-full">
            <img src="/logo-org.svg" alt="Handyzo" className="h-10 md:h-12 w-auto dark:brightness-0 dark:invert" />
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="w-full flex justify-center">
            <img src="/logo-org.svg" alt="Handyzo" className="h-8 w-auto object-left object-cover dark:brightness-0 dark:invert" style={{ maxWidth: '32px' }} />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex absolute -right-3 top-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full p-1 transition-transform z-50 ${isCollapsed ? "rotate-180" : ""}`}
        >
          <ClientIcon icon="ph:caret-left-bold" className="w-3 h-3" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/customer" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ClientIcon 
                icon={isActive ? `${link.icon}-fill` : link.icon} 
                className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} 
              />
              {!isCollapsed && <span className="text-[15px] md:text-sm whitespace-nowrap">{link.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Need Help?</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1 mb-3">Contact our support team anytime.</p>
            <Link href="/contact" className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors block text-center">
              Support
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
