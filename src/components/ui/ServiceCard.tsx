"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "./ClientIcon";
import { Service, ServicePackage } from "@/data/mockServices";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ServiceCard({ service }: { service: Service }) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const { addToCart, updateQuantity, items } = useCart();
  const { status } = useSession();
  const router = useRouter();
  
  const handleAddToCart = (pkg: ServicePackage) => {
    if (status === "unauthenticated") {
      toast.error("Please sign in first to add items to your cart");
      router.push("/sign-in");
      return;
    }
    addToCart(service, pkg);
  };
  
  // Heuristic: If description is > 95 characters, we consider it > 2 lines and show the read more toggle.
  const showReadMore = service.description.length > 95;

  return (
    <div className="relative flex flex-col w-full bg-white dark:bg-[#080E1A] rounded-[22px] overflow-hidden border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_38px_rgba(0,180,255,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_12px_35px_rgba(0,180,255,0.15)] transition-all duration-300 h-full group text-left hover:-translate-y-1 hover:border-[#00B4FF]/50 dark:hover:border-[#00B4FF]/40">
      
      {/* Compact Image Section */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800/50">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
        
        {/* Top Badges (1pt larger) */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          {service.badge ? (
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase shadow-md backdrop-blur-sm ${service.badgeColor || 'bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900'}`}>
              {service.badge}
            </span>
          ) : <div></div>}
          <span className="px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/25 text-white text-xs font-extrabold flex items-center gap-1 shadow-md">
            <ClientIcon icon="ph:star-fill" className="w-3.5 h-3.5 text-[#00B4FF]" />
            {service.rating}
          </span>
        </div>

        {/* Floating Time & Warranty Strip */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 pointer-events-none flex justify-start">
           <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-md border border-white/20 text-white shadow-lg max-w-full truncate">
              <div className="flex items-center gap-1 shrink-0">
                <ClientIcon icon="ph:clock-duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00B4FF]" />
                <span className="text-[11px] sm:text-xs font-bold tracking-tight">{service.time}</span>
              </div>
              <div className="w-0.5 h-3 bg-white/25 rounded-full shrink-0"></div>
              <div className="flex items-center gap-1 min-w-0 truncate">
                <ClientIcon icon="ph:shield-check-duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold tracking-tight truncate">{service.warranty}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow relative z-10 bg-white dark:bg-[#080E1A]">
        <div className="flex items-start justify-between gap-2">
          {/* Title increased by 1pt to 17px/18px */}
          <h3 className="text-[17px] sm:text-[18px] font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-[#00B4FF] transition-colors line-clamp-1">
            {service.title}
          </h3>
          {showReadMore && (
            <button 
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 text-slate-400 hover:text-[#00B4FF] hover:bg-blue-50 dark:hover:bg-[#00B4FF]/10 transition-colors mt-0.5"
              title={isDescExpanded ? "Show Less" : "Read More"}
            >
              <ClientIcon icon={isDescExpanded ? "ph:caret-up-bold" : "ph:caret-down-bold"} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        {/* Description increased by 1pt to 13px */}
        <div className="mt-1 mb-3.5">
          <p className={`text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
            {service.description}
          </p>
        </div>
        
        {/* Packages List (Vibrant UI, 1pt larger content, same compact height) */}
        <div className="flex flex-col mt-auto">
          {service.packages && service.packages.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Available Options</span>
              {service.packages.length > 2 && (
                <span className="text-[11px] font-extrabold text-[#00B4FF] bg-[#00B4FF]/10 dark:bg-[#00B4FF]/20 px-2.5 py-0.5 rounded-full border border-[#00B4FF]/20">
                  {service.packages.length} Options
                </span>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {service.packages?.slice(0, 2).map((pkg, idx) => {
              const qtyInCart = items.find(i => i.id === `${service.id}-${pkg.name}`)?.quantity || 0;
              
              return (
                <div 
                  key={idx} 
                  className="group/pkg flex items-center justify-between py-2 px-2.5 sm:px-3 rounded-xl bg-slate-50/90 dark:bg-[#0E1627] border border-slate-200/70 dark:border-slate-800/80 hover:border-[#00B4FF]/50 dark:hover:border-[#00B4FF]/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent dark:hover:from-blue-500/10 dark:hover:to-transparent transition-all duration-200 hover:shadow-xs text-left"
                >
                  <div className="flex flex-col pr-2 min-w-0 flex-1">
                    {/* Package title increased by 1pt to 13px */}
                    <span className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight truncate group-hover/pkg:text-[#00B4FF] transition-colors">{pkg.name}</span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {/* Price increased by 1pt to 14px (text-sm) */}
                      <span className="text-sm font-black text-[#00B4FF] dark:text-[#38bdf8] tracking-tight">₹{pkg.price}</span>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 line-through decoration-slate-300">₹{pkg.originalPrice}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-0.5"></span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <ClientIcon icon="ph:clock-fill" className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover/pkg:text-[#00B4FF] transition-colors" />
                        {pkg.time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    {status === "authenticated" && qtyInCart > 0 ? (
                      <div className="flex items-center justify-between w-[76px] h-7 bg-blue-500/15 dark:bg-blue-500/25 border border-[#00B4FF] rounded-lg overflow-hidden shadow-2xs">
                        <button onClick={() => updateQuantity(`${service.id}-${pkg.name}`, qtyInCart - 1)} className="w-6 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/20 transition-colors">
                          <ClientIcon icon="ph:minus-bold" className="w-3 h-3" />
                        </button>
                        <span className="flex-1 text-center font-black text-slate-900 dark:text-white text-xs">{qtyInCart}</span>
                        <button onClick={() => updateQuantity(`${service.id}-${pkg.name}`, qtyInCart + 1)} className="w-6 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/20 transition-colors">
                          <ClientIcon icon="ph:plus-bold" className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(pkg)}
                        className="h-7 px-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 border border-[#00B4FF]/40 text-[#00B4FF] dark:text-[#38bdf8] text-xs font-black tracking-wider uppercase transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00B4FF] hover:to-[#0070FF] hover:text-white hover:border-transparent active:scale-95 shadow-2xs flex items-center justify-center gap-1"
                      >
                        <ClientIcon icon="ph:plus-bold" className="w-3 h-3" />
                        <span>ADD</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {service.packages && service.packages.length > 2 && (
               <Link href={`/services/${service.slug}`} className="text-left pt-1 pl-1 block">
                  <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 hover:text-[#00B4FF] dark:hover:text-[#38bdf8] transition-colors inline-flex items-center gap-1">
                    + {service.packages.length - 2} more package{service.packages.length - 2 > 1 ? 's' : ''} inside
                    <ClientIcon icon="ph:arrow-right-bold" className="w-3 h-3 text-[#00B4FF]" />
                  </span>
               </Link>
            )}
          </div>
        </div>

      </div>
      
      {/* Sleek Integrated Bottom Bar with ambient hover */}
      <Link 
        href={`/services/${service.slug}`} 
        className="px-4 sm:px-5 py-3 bg-slate-50/90 dark:bg-[#050B14] border-t border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-[#00B4FF] dark:hover:text-[#38bdf8] group-hover:bg-blue-50/40 dark:group-hover:bg-[#08101E] text-[13px] font-extrabold flex items-center justify-between transition-all duration-300 group/footer"
      >
        <span>View full details & reviews</span>
        <span className="w-7 h-7 rounded-full bg-white dark:bg-[#121E32] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-[#00B4FF] group-hover/footer:translate-x-1 group-hover/footer:bg-gradient-to-r group-hover/footer:from-[#00B4FF] group-hover/footer:to-[#0070FF] group-hover/footer:text-white group-hover/footer:border-transparent transition-all shadow-2xs">
          <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5" />
        </span>
      </Link>

    </div>
  );
}
