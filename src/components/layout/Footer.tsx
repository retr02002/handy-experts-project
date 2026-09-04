"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center hover:text-[#00B4FF] group transition-colors">
      <span className="w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center text-[#00B4FF] shrink-0">
        <ClientIcon icon="ph:arrow-right" className="w-3.5 h-3.5" />
      </span>
      {children}
    </Link>
  );
}

type FooterProps = {
  categories?: { id: string; name: string; slug: string }[];
};

export function Footer({ categories = [] }: FooterProps) {
  return (
    <footer className="w-full bg-slate-50 dark:bg-[#020813] border-t border-slate-200 dark:border-slate-800/50 pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8">

          {/* Logo & Stats Column */}
          <div className="col-span-1 md:col-span-3 lg:col-span-2 flex flex-col pr-0 lg:pr-8">
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/logo-org.svg"
                alt="Handyzo"
                width={260}
                height={90}
                className="h-18 w-auto object-contain dark:brightness-0 dark:invert transition-transform hover:scale-105 origin-left"
              />
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-sm">
              Your trusted partner for home maintenance, professional cleaning, high-quality repairs, and everyday essential services.
            </p>
          </div>

          {/* Our Services */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:cube" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Our Services
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              {categories.length === 0 ? (
                <li><FooterLink href="/services">All Services</FooterLink></li>
              ) : (
                categories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <FooterLink href={`/services?category=${cat.slug}`}>{cat.name}</FooterLink>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Our Company */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:buildings" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Our Company
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><FooterLink href="#">About Us</FooterLink></li>
              <li><FooterLink href="#">Customers</FooterLink></li>
              <li><FooterLink href="#">Blog & News</FooterLink></li>
              <li><FooterLink href="#">Careers</FooterLink></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:lifebuoy" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Support & Help
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><FooterLink href="#">Documentation</FooterLink></li>
              <li><FooterLink href="#">Service Warranty</FooterLink></li>
              <li><FooterLink href="#">Contact Support</FooterLink></li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:globe" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Connect With Us
            </h4>
            <div className="flex flex-wrap gap-2 mb-8">
              <Link href="#" className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#00B4FF] hover:text-white dark:hover:bg-[#00B4FF] dark:hover:text-white transition-all hover:scale-110">
                <ClientIcon icon="ph:facebook-logo-fill" className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#00B4FF] hover:text-white dark:hover:bg-[#00B4FF] dark:hover:text-white transition-all hover:scale-110">
                <ClientIcon icon="ph:twitter-logo-fill" className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#00B4FF] hover:text-white dark:hover:bg-[#00B4FF] dark:hover:text-white transition-all hover:scale-110">
                <ClientIcon icon="ph:linkedin-logo-fill" className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#00B4FF] hover:text-white dark:hover:bg-[#00B4FF] dark:hover:text-white transition-all hover:scale-110">
                <ClientIcon icon="ph:instagram-logo-fill" className="w-4 h-4" />
              </Link>
            </div>

            <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <ClientIcon icon="ph:envelope-simple" className="w-4 h-4 text-slate-400 dark:text-[#00B4FF]/70" />
              Contact Info
            </h5>
            <a href="mailto:hello@Handyzo.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#00B4FF] transition-colors font-medium">
              hello@Handyzo.com
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[13px] font-medium text-slate-500 dark:text-slate-400">
            <Link href="/privacy" className="hover:text-[#00B4FF] transition-colors">Privacy Policy</Link>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <Link href="/terms" className="hover:text-[#00B4FF] transition-colors">Terms of Service</Link>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <Link href="/refund" className="hover:text-[#00B4FF] transition-colors">Refund Policy</Link>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <Link href="/cancellation" className="hover:text-[#00B4FF] transition-colors">Cancellation Policy</Link>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <Link href="/cookies" className="hover:text-[#00B4FF] transition-colors">Cookie Settings</Link>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium shrink-0 text-center lg:text-right">
            ©2025-{new Date().getFullYear()} All Rights Reserved by Handyzo.
          </p>
        </div>
      </div>
    </footer>
  );
}
