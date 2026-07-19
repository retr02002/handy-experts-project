"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

const BOTTOM_NAV_LINKS = [
  { href: "/customer/orders", label: "Orders", icon: "ph:shopping-cart" },
  { href: "/customer/bills", label: "Bills", icon: "ph:receipt" },
  { href: "/customer/rewards", label: "Rewards", icon: "ph:gift" },
  { href: "/customer/reviews", label: "Reviews", icon: "ph:star" },
  { href: "/customer/profile", label: "Profile", icon: "ph:user" },
];

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800 z-50 px-2 pb-safe flex items-center justify-around">
      {BOTTOM_NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href) && link.href !== "/customer";
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive 
                ? "text-[#00B4FF] dark:text-[#00B4FF]" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <ClientIcon 
                icon={isActive ? `${link.icon}-fill` : link.icon} 
                className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
              />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
