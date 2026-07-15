"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ClientIcon } from "./ClientIcon";
import { Service } from "@/data/mockServices";


export function ServiceCard({ service }: { service: Service }) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  return (
    <div className="flex flex-col w-full bg-slate-50 dark:bg-[#0B1221] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300 h-full group">
      
      {/* Image Top Half (Slightly Larger) */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase ${service.badgeColor}`}>
            {service.badge}
          </span>
          <span className="px-2 py-1 rounded-full bg-white text-slate-900 text-[10px] font-bold flex items-center gap-1 shadow-sm">
            <ClientIcon icon="ph:star-fill" className="w-3 h-3 text-[#00B4FF]" />
            {service.rating}
          </span>
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center text-white text-[10px] font-medium gap-2.5">
          <div className="flex items-center gap-1">
            <ClientIcon icon="ph:clock" className="w-3.5 h-3.5 opacity-80" />
            <span className="opacity-90">{service.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClientIcon icon="ph:shield-check" className="w-3.5 h-3.5 opacity-80" />
            <span className="opacity-90">{service.warranty}</span>
          </div>
        </div>
      </div>

      {/* Content Bottom Half */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow relative z-10 bg-white dark:bg-[#0B1221] rounded-t-xl -mt-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#00B4FF] transition-colors">
            {service.title}
          </h3>
          <button 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 hover:text-[#00B4FF] transition-colors"
            title="Read More"
          >
            <ClientIcon icon={isDescExpanded ? "ph:caret-up-bold" : "ph:caret-down-bold"} className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <p className={`text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
            {service.description}
          </p>
        </div>
        
        {/* Packages List (Compact) */}
        <div className="flex flex-col gap-2 mb-4">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Popular Packages</span>
          <div className="flex flex-col gap-1.5">
            {service.packages?.map((pkg, idx) => (
              <div key={idx} className="flex flex-col p-2.5 rounded-lg bg-slate-50 dark:bg-[#151f32] border border-slate-100 dark:border-slate-800 transition-colors hover:border-[#00B4FF]/30 hover:bg-white dark:hover:bg-[#1e2a44] shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{pkg.name}</span>
                  <button className="shrink-0 h-6 px-2.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#00B4FF] text-[10px] font-bold hover:bg-[#00B4FF] hover:text-white hover:border-[#00B4FF] transition-all shadow-sm">
                    ADD
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white">₹{pkg.price}</span>
                  <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 line-through">₹{pkg.originalPrice}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-0.5"></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <ClientIcon icon="ph:clock" className="w-3 h-3" />
                    {pkg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <button className="w-full h-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm">
            View all options
            <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
