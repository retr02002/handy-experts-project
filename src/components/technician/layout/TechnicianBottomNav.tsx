"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion } from "framer-motion";

const BOTTOM_NAV_LINKS = [
  { href: "/technician", label: "Home", icon: "ph:squares-four" },
  { href: "/technician/service-calls", label: "Jobs", icon: "ph:wrench" },
  { href: "theme", label: "Theme", icon: "theme" },
  { href: "/technician/wallet", label: "Wallet", icon: "ph:wallet" },
  { href: "/technician/profile", label: "Profile", icon: "ph:user" },
];

export function TechnicianBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 h-14 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-full z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center justify-between px-2">
      {BOTTOM_NAV_LINKS.map((link) => {
        if (link.href === "theme") {
          return (
            <div key="theme" className="relative z-50 flex items-center justify-center shrink-0 w-14">
              <ThemeToggle variant="mobile-nav" />
            </div>
          );
        }

        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/technician");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${isActive ? "text-amber-600 dark:text-amber-400" : ""}`}
            >
              {isActive && (
                <motion.div
                  layoutId="technician-bottom-nav-active"
                  className="absolute inset-0 bg-amber-500/10 dark:bg-amber-400/20 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <ClientIcon
                icon={isActive ? `${link.icon}-fill` : link.icon}
                className={`w-5 h-5 transition-transform relative z-10 ${isActive ? "scale-110" : ""}`}
              />
            </motion.div>
            <span className={`text-[10px] font-medium leading-none tracking-tight ${isActive ? "font-bold" : ""}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
