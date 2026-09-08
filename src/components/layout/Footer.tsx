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
    <footer className="w-full bg-slate-50 dark:bg-[#020813] border-t border-slate-200 dark:border-slate-800/50 pt-12 pb-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8">

          {/* Logo & Stats Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col pr-0 lg:pr-8">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/logo-org.svg"
                alt="Handyzo"
                width={200}
                height={70}
                className="h-14 w-auto object-contain dark:brightness-0 dark:invert transition-transform hover:scale-105 origin-left"
              />
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-[280px] sm:max-w-sm">
              We make home maintenance effortless. Whether it&apos;s a quick fix or a deep clean, our verified experts are just a tap away. Fast, reliable, and transparent.
            </p>
          </div>

          {/* Our Services */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:cube" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Our Services
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><FooterLink href="/services/ac-repair">AC Repair & Service</FooterLink></li>
              <li><FooterLink href="/services/plumbing">Plumbing Services</FooterLink></li>
              <li><FooterLink href="/services/electrical">Electrical Works</FooterLink></li>
              <li><FooterLink href="/services/cleaning">Home Cleaning</FooterLink></li>
              <li><FooterLink href="/services/painting">Painting Services</FooterLink></li>
              <li><FooterLink href="/services">View All Services</FooterLink></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:shield-check" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Legal & Policies
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/refund">Refund Policy</FooterLink></li>
              <li><FooterLink href="/cancellation">Cancellation Policy</FooterLink></li>
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
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-center">
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium text-center">
            ©2025-{new Date().getFullYear()} All Rights Reserved by Handyzo.
          </p>
        </div>
      </div>
    </footer>
  );
}
