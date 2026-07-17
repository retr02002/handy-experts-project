"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { CartButton } from "@/components/ui/CartButton";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
        <header
          id="main-header"
          className={`w-full max-w-7xl transition-all duration-300 rounded-full border pointer-events-auto backdrop-blur-xl ${isScrolled
            ? "bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-700/80 shadow-lg dark:shadow-2xl"
            : "bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-sm"
            }`}
        >
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-15 sm:h-18">
              {/* Left: Navigation & Mobile Cart */}
              <div className="flex-1 flex items-center justify-start">
                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-5 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Services</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">About</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Pricing</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Partners</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Blog</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Contact</Link>
                </nav>

                {/* Mobile Cart */}
                <div className="flex lg:hidden items-center -ml-1.5">
                  <CartButton />
                </div>
              </div>

              {/* Center: Logo */}
              <div className="flex justify-center items-center shrink-0">
                <Link href="/" className="flex items-center justify-center">
                  <Image
                    src="/logo-org.svg"
                    alt="Handy Experts"
                    width={180}
                    height={64}
                    className="h-12 sm:h-16 w-auto object-contain transition-all duration-300 hover:scale-105 drop-shadow-sm dark:brightness-0 dark:invert"
                    priority
                    unoptimized
                  />
                </Link>
              </div>

              {/* Right: Actions */}
              <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-3">
                <div className="hidden sm:block scale-100 origin-right">
                  <ThemeToggle />
                </div>

                {/* Desktop Cart */}
                <div className="hidden lg:block">
                  <CartButton />
                </div>

                <Link href="#" className="flex items-center text-[14px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors sm:ml-1">
                  <ClientIcon icon="ph:sign-in" width="22" height="22" className="sm:mr-1" />
                  <span className="hidden md:inline">Sign in</span>
                </Link>

                {/* Desktop Book Button */}
                <Link href="#" className="hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2 text-[14px] font-bold shadow-md transition-all hover:scale-105 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 whitespace-nowrap">
                  Book now
                </Link>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Bottom Fixed Navigation for Mobile (Floating Pill) */}
      <div className="fixed bottom-5 left-3 right-3 z-[60] lg:hidden">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-full px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <ClientIcon icon={pathname === '/' ? "ph:house-fill" : "ph:house"} width="20" height="20" />
            <span className="text-[9px] font-medium leading-none">Home</span>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF] transition-colors">
            <ClientIcon icon="ph:info" width="20" height="20" />
            <span className="text-[9px] font-medium leading-none">About</span>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF] transition-colors">
            <ClientIcon icon="ph:wrench" width="20" height="20" />
            <span className="text-[9px] font-medium leading-none">Services</span>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF] transition-colors">
            <ClientIcon icon="ph:article" width="20" height="20" />
            <span className="text-[9px] font-medium leading-none">Blog</span>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF] transition-colors">
            <ClientIcon icon="ph:envelope-simple" width="20" height="20" />
            <span className="text-[9px] font-medium leading-none">Contact</span>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF] transition-colors">
            <ClientIcon icon="ph:calendar-plus" width="20" height="20" />
            <span className="text-[9px] font-medium leading-none">Book Now</span>
          </Link>
        </div>
      </div>

      {/* Fixed Mobile Theme Toggle Above Bottom Nav */}
      <div className="fixed bottom-24 right-4 z-[70] lg:hidden">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-md border border-slate-200/50 dark:border-slate-700/50 p-0.5">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
