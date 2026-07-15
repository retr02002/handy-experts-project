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

export function Footer() {
  return (
    <footer className="w-full bg-slate-50 dark:bg-[#020813] border-t border-slate-200 dark:border-slate-800/50 pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-10 lg:gap-8">

          {/* Logo & Stats Column */}
          <div className="col-span-1 md:col-span-3 lg:col-span-2 flex flex-col pr-0 lg:pr-8">
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/logo-org.svg"
                alt="Handy Experts"
                width={260}
                height={90}
                className="h-16 w-auto object-contain dark:brightness-0 dark:invert transition-transform hover:scale-105 origin-left"
              />
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-sm">
              Your trusted partner for home maintenance, professional cleaning, high-quality repairs, and everyday essential services.
            </p>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 text-sm text-slate-900 dark:text-slate-300 font-medium group">
                <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-[#00B4FF]/10 flex items-center justify-center text-[#00B4FF] group-hover:scale-110 transition-transform">
                  <ClientIcon icon="ph:wrench-fill" className="w-4 h-4" />
                </div>
                10,000+ Services Delivered
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-900 dark:text-slate-300 font-medium group">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <ClientIcon icon="ph:shield-check-fill" className="w-4 h-4" />
                </div>
                99.99% Satisfaction Rate
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-900 dark:text-slate-300 font-medium group">
                <div className="w-8 h-8 rounded-lg bg-purple-100/50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                  <ClientIcon icon="ph:headset-fill" className="w-4 h-4" />
                </div>
                24/7 Dedicated Support
              </div>
            </div>
          </div>

          {/* Our Services */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:cube" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Our Services
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><FooterLink href="#">Cleaning Services</FooterLink></li>
              <li><FooterLink href="#">AC & Appliance</FooterLink></li>
              <li><FooterLink href="#">Plumbing Fixes</FooterLink></li>
              <li><FooterLink href="#">Electrical</FooterLink></li>
              <li><FooterLink href="#">Carpentry</FooterLink></li>
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
              <li><FooterLink href="#">Help Center</FooterLink></li>
              <li><FooterLink href="#">Documentation</FooterLink></li>
              <li><FooterLink href="#">Service Warranty</FooterLink></li>
              <li><FooterLink href="#">Contact Support</FooterLink></li>
              <li><FooterLink href="#">Community Forum</FooterLink></li>
            </ul>
          </div>

          {/* Legal & Terms */}
          <div className="col-span-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClientIcon icon="ph:scales" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
              Legal & Terms
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><FooterLink href="#">Privacy Policy</FooterLink></li>
              <li><FooterLink href="#">Terms of Service</FooterLink></li>
              <li><FooterLink href="#">Cookie Settings</FooterLink></li>
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
            <a href="mailto:hello@handyexperts.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#00B4FF] transition-colors font-medium">
              hello@handyexperts.com
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Handy Experts. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2">
              HANDY EXPERTS DELIVERED <span className="w-1.5 h-1.5 rotate-45 bg-[#00B4FF]"></span>
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#00B4FF] hover:text-white dark:hover:bg-[#00B4FF] dark:hover:text-white transition-colors"
              aria-label="Scroll to top"
            >
              <ClientIcon icon="ph:arrow-up-bold" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
