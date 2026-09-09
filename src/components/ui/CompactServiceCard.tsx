"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "./ClientIcon";
import type { CategoryServiceSummary } from "@/types/category";
import { resolveServiceRating } from "@/lib/serviceRating";

export function CompactServiceCard({ service }: { service: CategoryServiceSummary }) {
  const rating = resolveServiceRating(service);

  return (
    <Link 
      href={`/services/${service.slug}`}
      className="group flex flex-col items-center cursor-pointer w-full text-center"
    >
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 mb-3 border border-slate-200/50 dark:border-slate-700/50">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/5" />

        {/* Optional small rating badge */}
        {rating.score && (
          <div className="absolute bottom-2 right-2 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm flex items-center gap-1 border border-white/20">
            <ClientIcon icon="ph:star-fill" className="text-amber-400 w-3 h-3" />
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-none">{rating.score}</span>
          </div>
        )}
      </div>

      <h3 className="text-[13px] sm:text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#00B4FF] transition-colors leading-snug line-clamp-2 px-1">
        {service.title}
      </h3>
    </Link>
  );
}
