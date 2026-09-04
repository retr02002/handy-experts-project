"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { CategoryWithServices } from "@/types/category";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithServices;
};

export function CategoryServicesModal({ isOpen, onClose, category }: Props) {
  const [mounted, setMounted] = useState(false);

  // Deferred so hydration isn't forced through a synchronous cascading render.
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/75 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#0B1221] w-full sm:max-w-lg md:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 overflow-hidden border border-slate-200 dark:border-slate-800 z-10">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-900/80 text-white dark:bg-white/90 dark:text-slate-900 shadow-lg border-2 border-white/20 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
        </button>

        {/* Header. Background-image, not next/image — category tiles can hold a
            pasted third-party URL that next.config remotePatterns would reject
            at runtime. */}
        <div className="relative shrink-0 h-32 sm:h-36 bg-slate-800 bg-cover bg-center" style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/20" />
          <div className="absolute bottom-0 left-0 p-4 sm:p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <ClientIcon icon={category.icon || "ph:tag-fill"} className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">{category.name}</h2>
              <p className="text-[11px] sm:text-xs font-semibold text-white/80">
                {category.services.length} service{category.services.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
          {category.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{category.description}</p>
          )}

          {category.services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <ClientIcon icon="ph:wrench-duotone" className="w-9 h-9 text-slate-300" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No services in this category yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {category.services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  onClick={onClose}
                  className="group flex flex-col p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E172B] hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div
                    className="w-full aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-800 bg-cover bg-center mb-2.5 shrink-0"
                    style={{ backgroundImage: `url(${service.image})` }}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#00B4FF] transition-colors leading-tight">
                        {service.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1.5">
                      {service.rating && (
                        <span className="flex items-center gap-0.5">
                          <ClientIcon icon="ph:star-fill" className="w-2.5 h-2.5 text-amber-400" />
                          {service.rating.split(" ")[0]}
                        </span>
                      )}
                      {service.time && (
                        <>
                          <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="truncate">{service.time}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      {service.fromPrice !== null ? (
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          ₹{service.fromPrice}
                        </p>
                      ) : (
                        <div />
                      )}
                      {service.badge && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {service.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {category.services.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-[#0B1221]">
            <Link
              href={`/services?category=${category.slug}`}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 dark:bg-[#00B4FF] text-white text-sm font-black hover:opacity-90 transition-opacity"
            >
              View all in {category.name}
              <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
