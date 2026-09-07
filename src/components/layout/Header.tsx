"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { CartButton } from "@/components/ui/CartButton";
import { useCart } from "@/context/CartContext";
import { useChat } from "@/context/ChatContext";
import { useSession } from "next-auth/react";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { MobileAccountNavButton } from "@/components/layout/MobileAccountNavButton";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const { isOpen, toggleChat } = useChat();

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
          className={`w-full max-w-7xl transition-all duration-300 rounded-full border pointer-events-auto ${isScrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/80 dark:border-slate-700/80 shadow-lg dark:shadow-2xl"
            : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-700/50 shadow-sm"
            }`}
        >
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-15 sm:h-18">
              {/* Left: Navigation & Mobile Cart */}
              <div className="flex-1 flex items-center justify-start">
                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-5 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                  <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Home</Link>
                  <Link href="/services" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Services</Link>
                  <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Contact</Link>
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
                    alt="Handyzo"
                    width={160}
                    height={64}
                    priority
                    className="h-8 sm:h-13 w-auto object-contain transition-all duration-300 hover:scale-105 drop-shadow-sm dark:brightness-0 dark:invert"
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

                {/* Account entry point moved to the mobile bottom nav — the
                    header only shows it on sm+ screens now, so it isn't
                    duplicated on mobile. */}
                {session ? (
                  <div className="hidden sm:block sm:ml-1">
                    <UserDropdown />
                  </div>
                ) : (
                  <Link href="/sign-in" className="hidden sm:flex items-center text-[14px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors sm:ml-1">
                    <ClientIcon icon="ph:sign-in" width="22" height="22" className="sm:mr-1" />
                    <span className="hidden md:inline">Sign in</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Bottom Fixed Navigation for Mobile (Full Width App-like) — hidden during checkout, which has its own dedicated action bar */}
      <div className={`fixed bottom-0 left-0 right-0 w-full z-[60] lg:hidden`}>
        <div className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] px-1 pb-safe h-16 flex items-center justify-between">
          <Link href="/" className={`group flex flex-col items-center justify-center w-full h-full relative transition-colors ${pathname === '/' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <div className="relative flex flex-col items-center justify-center h-full space-y-1 w-full">
              <ClientIcon icon={pathname === '/' ? "ph:house-fill" : "ph:house"} className={`w-6 h-6 transition-all duration-300 group-hover:-translate-y-1 group-active:scale-90 ${pathname === '/' ? 'scale-110 drop-shadow-[0_2px_8px_rgba(0,180,255,0.4)]' : ''}`} />
              <span className={`text-[11px] font-medium leading-none mt-0.5 transition-all duration-300 ${pathname === '/' ? 'translate-y-0' : 'group-hover:translate-y-0.5'}`}>Home</span>
              {pathname === '/' && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00B4FF] shadow-[0_0_8px_rgba(0,180,255,0.8)] animate-in fade-in slide-in-from-bottom-1" />
              )}
            </div>
          </Link>

          <Link href="/services" className={`group flex flex-col items-center justify-center w-full h-full relative transition-colors ${pathname.startsWith('/services') ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <div className="relative flex flex-col items-center justify-center h-full space-y-1 w-full">
              <ClientIcon icon={pathname.startsWith('/services') ? "ph:wrench-fill" : "ph:wrench"} className={`w-6 h-6 transition-all duration-300 group-hover:-translate-y-1 group-active:scale-90 ${pathname.startsWith('/services') ? 'scale-110 drop-shadow-[0_2px_8px_rgba(0,180,255,0.4)]' : ''}`} />
              <span className={`text-[11px] font-medium leading-none mt-0.5 transition-all duration-300 ${pathname.startsWith('/services') ? 'translate-y-0' : 'group-hover:translate-y-0.5'}`}>Services</span>
              {pathname.startsWith('/services') && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00B4FF] shadow-[0_0_8px_rgba(0,180,255,0.8)] animate-in fade-in slide-in-from-bottom-1" />
              )}
            </div>
          </Link>

          {/* Theme Toggle Center Button */}
          <ThemeToggle variant="mobile-nav" />

          <Link href="/contact" className={`group flex flex-col items-center justify-center w-full h-full relative transition-colors ${pathname === '/contact' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <div className="relative flex flex-col items-center justify-center h-full space-y-1 w-full">
              <ClientIcon icon={pathname === '/contact' ? "ph:envelope-simple-fill" : "ph:envelope-simple"} className={`w-6 h-6 transition-all duration-300 group-hover:-translate-y-1 group-active:scale-90 ${pathname === '/contact' ? 'scale-110 drop-shadow-[0_2px_8px_rgba(0,180,255,0.4)]' : ''}`} />
              <span className={`text-[11px] font-medium leading-none mt-0.5 transition-all duration-300 ${pathname === '/contact' ? 'translate-y-0' : 'group-hover:translate-y-0.5'}`}>Contact</span>
              {pathname === '/contact' && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00B4FF] shadow-[0_0_8px_rgba(0,180,255,0.8)] animate-in fade-in slide-in-from-bottom-1" />
              )}
            </div>
          </Link>

          <MobileAccountNavButton />
        </div>
      </div>

      {/* Floating AI Chatbot Button Above Bottom Nav */}
      <div className={`fixed right-4 z-[50] lg:hidden transition-all duration-300 ${pathname.startsWith('/cart') && totalItems > 0 ? 'hidden' : pathname.startsWith('/services/') && totalItems > 0 ? 'bottom-[132px]' : 'bottom-20'}`}>
        <button
          onClick={toggleChat}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-gradient-to-tr from-[#00B4FF] to-[#0096d6] text-white shadow-[#00B4FF]/30'}`}
          aria-label="Ask AI"
        >
          <ClientIcon icon="ph:robot-fill" className="w-7 h-7" />
        </button>
      </div>

      {/* WhatsApp Floating Button */}
      <div className={`fixed right-4 lg:right-6 z-[50] transition-all duration-300 ${pathname.startsWith('/cart') && totalItems > 0 ? 'hidden' : pathname.startsWith('/services/') && totalItems > 0 ? 'bottom-[196px] lg:bottom-[104px]' : 'bottom-[144px] lg:bottom-[104px]'}`}>
        <a
          href="https://wa.me/918309680484"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Chat with us on WhatsApp"
        >
          <ClientIcon icon="ph:whatsapp-logo-fill" className="w-7 h-7 lg:w-8 lg:h-8" />
        </a>
      </div>
    </>
  );
}
