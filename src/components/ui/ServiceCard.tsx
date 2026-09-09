"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "./ClientIcon";
import { Service, ServicePackage } from "@/types/service";
import { resolveServiceRating } from "@/lib/serviceRating";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ServiceCard({ service }: { service: Service }) {
  const rating = resolveServiceRating(service);

  return (
    <div className="relative flex flex-col w-full bg-white dark:bg-[#0B1221] rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,180,255,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 h-full group text-left">
      
      {/* Compact Image Section */}
      <div className="relative h-32 sm:h-40 w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800/50">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        
        {/* Floating Time Strip */}
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
           <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-sm backdrop-blur-sm border border-white/20">
             <ClientIcon icon="ph:clock-duotone" className="w-3.5 h-3.5 text-[#00B4FF]" />
             <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">{service.time}</span>
           </div>
        </div>

        {/* Rating Badge */}
        {rating.score && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
              <ClientIcon icon="ph:star-fill" className="w-3 h-3 text-amber-400" />
              {rating.score}
              {rating.countLabel && <span className="font-medium text-white/70">{rating.countLabel}</span>}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex flex-col flex-grow relative z-10 bg-white dark:bg-[#080E1A]">
        {/* Service Title */}
        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-[#00B4FF] transition-colors line-clamp-1 mb-3">
          {service.title}
        </h3>
        
        {/* Sub-services (Packages) Grid */}
        <div className="grid grid-cols-2 gap-1.5 mt-auto">
          {service.packages?.slice(0, 2).map((pkg, idx) => (
            <div 
              key={idx} 
              className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between gap-1 group/sub hover:border-[#00B4FF]/30 transition-colors"
            >
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2 group-hover/sub:text-[#00B4FF] transition-colors">
                {pkg.name}
              </span>
              <div className="flex flex-col mt-1">
                <span className="text-[9px] text-slate-400 line-through leading-none">₹{pkg.originalPrice}</span>
                <span className="text-[12px] font-black text-slate-900 dark:text-white leading-none mt-0.5">₹{pkg.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom View Details Button */}
        <div className="mt-3.5">
          <Link 
            href={`/services/${service.slug}`} 
            className="w-full h-10 flex items-center justify-center rounded-xl bg-[#00B4FF] lg:bg-slate-100 lg:dark:bg-slate-800 lg:hover:bg-[#00B4FF] text-white lg:text-slate-700 lg:dark:text-slate-200 lg:hover:text-white text-[12px] font-extrabold uppercase tracking-wide transition-all duration-300 shadow-sm lg:shadow-none lg:hover:shadow-md group/btn"
          >
            <span>View Details</span>
            <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5 ml-1.5 opacity-100 translate-x-0 lg:opacity-0 lg:-translate-x-2 lg:group-hover/btn:opacity-100 lg:group-hover/btn:translate-x-0 transition-all duration-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
