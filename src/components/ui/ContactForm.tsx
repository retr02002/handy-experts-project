"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ContactForm() {
  return (
    <div className="h-full bg-slate-50 dark:bg-[#0B1120] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#00B4FF]/10 flex items-center justify-center text-[#00B4FF]">
          <ClientIcon icon="ph:paper-plane-tilt-fill" className="w-5 h-5" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Send us a message</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 ml-[52px]">We will get back to you shortly</p>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-wider text-slate-900 dark:text-slate-300 uppercase">Your Name</label>
            <input 
              type="text" 
              placeholder="John Doe"
              className="w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50 transition-all shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-wider text-slate-900 dark:text-slate-300 uppercase">Email Address</label>
            <input 
              type="email" 
              placeholder="john@example.com"
              className="w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-wider text-slate-900 dark:text-slate-300 uppercase">Subject</label>
          <input 
            type="text" 
            placeholder="How can we help you?"
            className="w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-wider text-slate-900 dark:text-slate-300 uppercase">Your Message</label>
          <textarea 
            rows={4}
            placeholder="Tell us more about your inquiry..."
            className="w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50 transition-all shadow-sm resize-none"
          ></textarea>
        </div>

        <div className="pt-2">
          <button 
            type="button"
            className="w-full bg-[#00B4FF] hover:bg-[#009EE0] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,180,255,0.3)] hover:shadow-[0_0_25px_rgba(0,180,255,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <ClientIcon icon="ph:paper-plane-tilt-bold" className="w-4 h-4" />
            Send Message
          </button>
          <p className="text-[10px] text-center text-slate-500 dark:text-slate-500 mt-4">
            By submitting, you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>
      </form>
    </div>
  );
}
