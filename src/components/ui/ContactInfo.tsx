import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ContactInfo() {
  return (
    <div className="h-auto lg:h-full w-full bg-slate-50 dark:bg-[#0B1120] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm flex flex-col">
      
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Contact Information</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Reach out to us directly through any of these channels.</p>
      </div>

      <div className="flex flex-col gap-8 flex-1 justify-center">
        
        {/* Chat to us */}
        <div className="flex items-start gap-5 group cursor-pointer w-full">
          <div className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-center shrink-0 bg-white dark:bg-[#131B2C] group-hover:bg-[#00B4FF] group-hover:border-[#00B4FF] transition-all duration-300 shadow-sm group-hover:shadow-[0_0_20px_rgba(0,180,255,0.3)]">
            <ClientIcon icon="ph:envelope-simple" className="w-5 h-5 text-[#00B4FF] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-slate-900 dark:text-white font-bold text-base mb-1 tracking-tight group-hover:text-[#00B4FF] transition-colors truncate">Chat to us</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 truncate">Our friendly team is here to help.</p>
            <a href="mailto:contact@Handyzo.com" className="text-[#00B4FF] font-bold text-sm hover:underline break-all inline-block">
              contact@Handyzo.com
            </a>
          </div>
        </div>

        {/* Call us */}
        <div className="flex items-start gap-5 group cursor-pointer w-full">
          <div className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-center shrink-0 bg-white dark:bg-[#131B2C] group-hover:bg-[#00B4FF] group-hover:border-[#00B4FF] transition-all duration-300 shadow-sm group-hover:shadow-[0_0_20px_rgba(0,180,255,0.3)]">
            <ClientIcon icon="ph:phone" className="w-5 h-5 text-[#00B4FF] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-slate-900 dark:text-white font-bold text-base mb-1 tracking-tight group-hover:text-[#00B4FF] transition-colors truncate">Call us</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 truncate">Mon-Sat from 8am to 8pm.</p>
            <a href="tel:+919403892784" className="text-[#00B4FF] font-bold text-sm hover:underline break-words inline-block">
              +91 9403892784
            </a>
          </div>
        </div>

        {/* Visit us */}
        <div className="flex items-start gap-5 group cursor-pointer w-full">
          <div className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-center shrink-0 bg-white dark:bg-[#131B2C] group-hover:bg-[#00B4FF] group-hover:border-[#00B4FF] transition-all duration-300 shadow-sm group-hover:shadow-[0_0_20px_rgba(0,180,255,0.3)]">
            <ClientIcon icon="ph:map-pin" className="w-5 h-5 text-[#00B4FF] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-slate-900 dark:text-white font-bold text-base mb-1 tracking-tight group-hover:text-[#00B4FF] transition-colors truncate">Visit us</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 truncate">Come say hello at our office.</p>
            <p className="text-[#00B4FF] font-bold text-sm leading-relaxed break-words">
              Mf-2 p.s nagar masab tank Mehdipatnam Hyderabad 500028
            </p>
          </div>
        </div>

      </div>

      {/* Map Card */}
      <a 
        href="https://maps.google.com/?q=Mf-2+p.s+nagar+masab+tank+Mehdipatnam+Hyderabad+500028" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block mt-8 h-[150px] relative rounded-2xl overflow-hidden group border border-slate-200 dark:border-slate-800/80 shadow-sm shrink-0"
      >
        <div className="absolute inset-0 bg-slate-100 dark:bg-[#131B2C]">
          <div className="absolute inset-0 opacity-40 dark:opacity-30 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent dark:from-[#0B1120] dark:via-[#0B1120]/60" />
        </div>
        
        <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ClientIcon icon="ph:map-trifold" className="w-5 h-5 shrink-0 text-[#00B4FF]" />
            <span className="text-white font-bold text-sm tracking-tight truncate">Hyderabad HQ</span>
          </div>
          <div className="w-8 h-8 shrink-0 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-[#00B4FF] group-hover:border-[#00B4FF] transition-colors shadow-sm">
            <ClientIcon icon="ph:arrow-up-right" className="w-4 h-4 text-white" />
          </div>
        </div>
      </a>
    </div>
  );
}
