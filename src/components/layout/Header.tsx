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
                  <Link href="/services" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Services</Link>
                  <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">About</Link>
                  <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Blog</Link>
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

                {session ? (
                  <div className="sm:ml-1">
                    <UserDropdown />
                  </div>
                ) : (
                  <Link href="/sign-in" className="flex items-center text-[14px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors sm:ml-1">
                    <ClientIcon icon="ph:sign-in" width="22" height="22" className="sm:mr-1" />
                    <span className="hidden md:inline">Sign in</span>
                  </Link>
                )}

                {/* Desktop Book Button */}
                <Link href="/book-now" className="hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2 text-[14px] font-bold shadow-md transition-all hover:scale-105 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 whitespace-nowrap">
                  Book now
                </Link>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Bottom Fixed Navigation for Mobile (Full Width App-like) — hidden during checkout, which has its own dedicated action bar */}
      <div className={`fixed bottom-0 left-0 right-0 w-full z-[60] lg:hidden`}>
        <div className="bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] px-1 pb-safe h-16 flex items-center justify-between">
          <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <ClientIcon icon={pathname === '/' ? "ph:house-fill" : "ph:house"} className={`w-5 h-5 transition-transform ${pathname === '/' ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-medium leading-none mt-0.5">Home</span>
          </Link>

          <Link href="/about" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/about' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <ClientIcon icon={pathname === '/about' ? "ph:info-fill" : "ph:info"} className={`w-5 h-5 transition-transform ${pathname === '/about' ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-medium leading-none mt-0.5">About</span>
          </Link>

          <Link href="/services" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname.startsWith('/services') ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <ClientIcon icon={pathname.startsWith('/services') ? "ph:wrench-fill" : "ph:wrench"} className={`w-5 h-5 transition-transform ${pathname.startsWith('/services') ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-medium leading-none mt-0.5">Services</span>
          </Link>

          {/* AI Chatbot Center Button */}
          <button
            onClick={toggleChat}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors group px-1 ${isOpen ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}
          >
            <div className={`flex items-center justify-center w-[40px] h-[40px] -mt-6 rounded-full border-[3px] border-white dark:border-[#0B1120] shadow-md transition-transform group-hover:scale-110 group-active:scale-95 ${isOpen ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-gradient-to-tr from-[#00B4FF] to-[#0096d6] text-white'}`}>
              <ClientIcon icon="ph:robot-fill" className="w-5 h-5" />
            </div>
            <span className={`text-[9px] font-bold -mt-1 leading-none ${isOpen ? 'font-semibold' : ''}`}>Ask AI</span>
          </button>

          <Link href="/blog" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/blog' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <ClientIcon icon={pathname === '/blog' ? "ph:article-fill" : "ph:article"} className={`w-5 h-5 transition-transform ${pathname === '/blog' ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-medium leading-none mt-0.5">Blog</span>
          </Link>

          <Link href="/contact" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/contact' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <ClientIcon icon={pathname === '/contact' ? "ph:envelope-simple-fill" : "ph:envelope-simple"} className={`w-5 h-5 transition-transform ${pathname === '/contact' ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-medium leading-none mt-0.5">Contact</span>
          </Link>

          <Link href="/book-now" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/book-now' ? 'text-[#00B4FF]' : 'text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]'}`}>
            <ClientIcon icon={pathname === '/book-now' ? "ph:calendar-plus-fill" : "ph:calendar-plus"} className={`w-5 h-5 transition-transform ${pathname === '/book-now' ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-medium leading-none mt-0.5">Book</span>
          </Link>
        </div>
      </div>

      {/* Fixed Mobile Theme Toggle Above Bottom Nav — hidden during checkout, which has its own dedicated action bar */}
      <div className={`fixed right-4 z-[70] lg:hidden transition-all duration-300 ${pathname.startsWith('/cart') && totalItems > 0 ? 'hidden' : pathname.startsWith('/services/') && totalItems > 0 ? 'bottom-[160px]' : 'bottom-24'}`}>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-md border border-slate-200/50 dark:border-slate-700/50 p-0.5">
          <ThemeToggle />
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <div className={`fixed right-4 lg:right-6 z-[70] transition-all duration-300 ${pathname.startsWith('/cart') && totalItems > 0 ? 'hidden' : pathname.startsWith('/services/') && totalItems > 0 ? 'bottom-[208px] lg:bottom-[104px]' : 'bottom-[144px] lg:bottom-[104px]'}`}>
        <a
          href="https://wa.me/1234567890"
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
