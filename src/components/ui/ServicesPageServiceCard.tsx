"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "./ClientIcon";
import { Service, ServicePackage } from "@/types/service";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ServicesPageServiceCard({ service }: { service: Service }) {
  return (
    <div className="relative flex flex-col w-full bg-white dark:bg-[#0B1221] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 h-full group text-left">
      
      {/* Compact Image Section */}
      <div className="relative aspect-square w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800/50">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-grow relative z-10 bg-white dark:bg-[#080E1A]">
        {/* Service Title */}
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-[#00B4FF] transition-colors line-clamp-2 mb-2">
          {service.title}
        </h3>
        
        {/* Bottom View Details Button */}
        <div className="mt-auto pt-1">
          <Link 
            href={`/services/${service.slug}`} 
            className="w-full h-8 sm:h-9 flex items-center justify-center rounded-lg bg-[#00B4FF]/10 hover:bg-[#00B4FF] text-[#00B4FF] hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all duration-300"
          >
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
