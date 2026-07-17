"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "./ClientIcon";
import { Service } from "@/data/mockServices";
import { useCart } from "@/context/CartContext";

export function ServiceCard({ service }: { service: Service }) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const { addToCart, items } = useCart();
  
  // Heuristic: If description is > 95 characters, we consider it > 2 lines and show the read more toggle.
  const showReadMore = service.description.length > 95;

  return (
    <div className="flex flex-col w-full bg-white dark:bg-[#0B1221] rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-none transition-all duration-300 h-full group text-left">
      
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {service.badge ? (
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${service.badgeColor || 'bg-slate-900 text-white'}`}>
              {service.badge}
            </span>
          ) : <div></div>}
          <span className="px-2.5 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md">
            <ClientIcon icon="ph:star-fill" className="w-3.5 h-3.5 text-[#00B4FF]" />
            {service.rating}
          </span>
        </div>

        {/* Floating Time & Warranty Pill - Left Aligned */}
        <div className="absolute bottom-4 left-4">
           <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <div className="flex items-center gap-1.5">
                <ClientIcon icon="ph:clock-duotone" className="w-4 h-4 text-[#00B4FF]" />
                <span className="text-xs font-bold tracking-wide">{service.time}</span>
              </div>
              <div className="w-px h-3.5 bg-white/30 rounded-full"></div>
              <div className="flex items-center gap-1.5">
                <ClientIcon icon="ph:shield-check-duotone" className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-wide">{service.warranty}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow relative z-10 bg-white dark:bg-[#0B1221]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#00B4FF] transition-colors line-clamp-2">
            {service.title}
          </h3>
          {showReadMore && (
            <button 
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 hover:text-[#00B4FF] hover:bg-blue-50 dark:hover:bg-[#00B4FF]/10 transition-colors"
              title={isDescExpanded ? "Show Less" : "Read More"}
            >
              <ClientIcon icon={isDescExpanded ? "ph:caret-up-bold" : "ph:caret-down-bold"} className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <p className={`text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
            {service.description}
          </p>
        </div>
        
        {/* Packages List (Streamlined & Compact) */}
        <div className="flex flex-col gap-3 mt-auto">
          {service.packages && service.packages.length > 0 && (
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Available Options</span>
              {service.packages.length > 2 && (
                <span className="text-[10px] font-bold text-[#00B4FF] bg-[#00B4FF]/10 px-2 py-1 rounded-md">
                  {service.packages.length} Variants
                </span>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-2.5">
            {service.packages?.slice(0, 2).map((pkg, idx) => {
              const qtyInCart = items.find(i => i.id === `${service.id}-${pkg.name}`)?.quantity || 0;
              
              return (
                <div 
                  key={idx} 
                  className="group/pkg flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151f32] border border-slate-100 dark:border-slate-800/80 hover:border-[#00B4FF]/30 hover:bg-white dark:hover:bg-[#1e2a44] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,180,255,0.06)] hover:-translate-y-0.5 text-left"
                >
                  <div className="flex flex-col gap-1 w-full pr-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">{pkg.name}</span>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">₹{pkg.price}</span>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 line-through decoration-slate-300/80">₹{pkg.originalPrice}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-0.5"></span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover/pkg:text-[#00B4FF] transition-colors">
                        <ClientIcon icon="ph:clock-fill" className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover/pkg:text-[#00B4FF]/80 transition-colors" />
                        {pkg.time}
                      </span>
                    </div>
                  </div>
                  
                  {qtyInCart > 0 ? (
                    <div className="shrink-0 flex items-center justify-center h-9 px-4 rounded-xl bg-[#00B4FF]/10 border border-[#00B4FF]/20 text-[#00B4FF] text-xs font-black">
                      {qtyInCart} ADDED
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(service, pkg)}
                      className="shrink-0 h-9 px-5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-[#00B4FF] text-xs font-black transition-all hover:bg-[#00B4FF] hover:text-white hover:border-[#00B4FF] active:scale-95 shadow-sm"
                    >
                      ADD
                    </button>
                  )}
                </div>
              );
            })}
            
            {service.packages && service.packages.length > 2 && (
               <div className="text-left pt-1 pb-1 pl-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-[#00B4FF] cursor-pointer transition-colors">
                    + {service.packages.length - 2} more package{service.packages.length - 2 > 1 ? 's' : ''} inside
                  </span>
               </div>
            )}
          </div>
        </div>

      </div>
      
      {/* Bottom Action Area */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 bg-white dark:bg-[#0B1221] mt-auto flex">
        <Link 
          href={`/services/${service.slug}`} 
          className="w-full h-12 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-bold flex items-center justify-between transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98]"
        >
          <span>View all details</span>
          <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4 opacity-80" />
        </Link>
      </div>

    </div>
  );
}
