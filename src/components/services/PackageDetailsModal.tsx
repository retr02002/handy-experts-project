"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Service, ServicePackage } from "@/data/mockServices";
import { ClientIcon } from "@/components/ui/ClientIcon";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  pkg: ServicePackage;
  onAdd: () => void;
  qtyInCart: number;
  onUpdateQty: (newQty: number) => void;
};

export function PackageDetailsModal({ isOpen, onClose, service, pkg, onAdd, qtyInCart, onUpdateQty }: Props) {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container - Single Column Layout */}
      <div className="relative bg-white dark:bg-[#0B1221] w-full sm:max-w-lg md:max-w-xl rounded-t-[1.5rem] sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 overflow-hidden border border-slate-200 dark:border-slate-800">

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 dark:bg-black/40 backdrop-blur-md text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-black/60 shadow-sm transition-colors border border-white/40 dark:border-white/10"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
        </button>

        {/* Compact Image Header */}
        <div className="relative w-full h-[100px] sm:h-[130px] shrink-0 border-b border-slate-100 dark:border-slate-800">
          <Image
            src={service.image}
            alt={pkg.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">{pkg.name}</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">

          {/* Single Column Flow */}
          <div className="flex flex-col gap-6 sm:gap-7">

            {/* Pricing Header */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{pkg.price}
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-400 line-through">₹{pkg.originalPrice}</span>
              <span className="px-2 py-0.5 text-[10px] font-black text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 rounded uppercase tracking-wider">Save ₹{pkg.originalPrice - pkg.price}</span>
            </div>

            {/* Quick Badges */}
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-500/30">
                  <ClientIcon icon="ph:clock-duotone" className="w-4 h-4 text-[#00B4FF]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Duration</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{pkg.time}</span>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-500/30">
                  <ClientIcon icon="ph:shield-check-duotone" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Warranty</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{service.warranty}</span>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">
                Whats Included
              </h3>
              <div className="flex flex-col gap-2">
                {(pkg.details || pkg.features).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 text-[#00B4FF] shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Service Process Timeline (Restored) */}
            {service.howItWorks && (
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
                  Service Process
                </h3>
                <div className="flex flex-col relative pl-2">
                  <div className="absolute left-[13px] top-2 bottom-6 w-px bg-slate-200 dark:bg-slate-800" />
                  {service.howItWorks.map((step, idx) => (
                    <div key={idx} className="flex gap-3 relative z-10 mb-4 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-[#0f172a] border-[3px] border-[#00B4FF] flex items-center justify-center text-[10px] font-black text-[#00B4FF] shrink-0">
                          {step.step}
                        </div>
                      </div>
                      <div className="pt-0.5 pb-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{step.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Handy Experts Promise */}
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">
                Handy Experts Promise
              </h3>
              <div className="flex flex-col gap-2.5">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl flex gap-3 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                  <ClientIcon icon="ph:shield-check-fill" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">30-Day Guarantee</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">If the issue recurs within 30 days, we return and fix it at no extra charge.</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl flex gap-3 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                  <ClientIcon icon="ph:user-circle-gear-fill" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Verified Technician</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Background-checked, vetted, trained professional on every booking.</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl flex gap-3 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                  <ClientIcon icon="ph:receipt-fill" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Transparent Repair Quote</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Receive a clear diagnosis and repair estimate before any work begins.</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Detailed Reviews */}
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
                Customer Reviews
              </h3>

              {/* Rating Breakdown */}
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ClientIcon icon="ph:star-fill" className="text-orange-400 w-6 h-6 sm:w-8 sm:h-8" />
                    4.6
                  </span>
                  <span className="text-sm text-slate-500 font-bold mb-1">263 reviews</span>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { stars: 5, pct: 62 },
                    { stars: 4, pct: 37 },
                    { stars: 3, pct: 0 },
                    { stars: 2, pct: 0 },
                    { stars: 1, pct: 1 },
                  ].map(row => (
                    <div key={row.stars} className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 w-2.5">{row.stars}</span>
                      <ClientIcon icon="ph:star-fill" className="w-3 h-3 text-orange-400" />
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: `${row.pct}%` }}></div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 w-7 text-right">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Cards */}
              <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-5">
                {/* Review 1 */}
                <div className="flex flex-col gap-2.5 pb-5 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center font-black text-base">C</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Chandrika Rathore</p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <ClientIcon key={i} icon="ph:star-fill" className="w-3 h-3 text-orange-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      <ClientIcon icon="ph:calendar-blank" className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Jul 2026</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    No more dripping now. Very satisfied.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">On Time Service</span>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="flex flex-col gap-2.5 pb-5 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-black text-base">P</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Pankaj Sastry</p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <ClientIcon key={i} icon="ph:star-fill" className="w-3 h-3 text-orange-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      <ClientIcon icon="ph:calendar-blank" className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Jul 2026</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    Last week Water pump failed to switch off automatically causing issues... <button className="text-[#00B4FF] hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">Read More</button>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">Reasonably Priced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            {service.faqs && (
              <>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">
                    FAQs
                  </h3>
                  <div className="flex flex-col gap-2">
                    {service.faqs.slice(0, 3).map((faq, idx) => (
                      <details key={idx} className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm group [&_summary::-webkit-details-marker]:hidden">
                        <summary className="w-full text-left p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer focus:outline-none">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 pr-2">{faq.question}</span>
                          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 group-open:rotate-180 transition-transform duration-300 group-open:text-[#00B4FF] group-open:bg-[#00B4FF]/10">
                            <ClientIcon icon="ph:caret-down-bold" className="w-3.5 h-3.5" />
                          </div>
                        </summary>
                        <div className="px-3 pb-3 sm:px-4 sm:pb-4 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0B1221] shadow-[0_-5px_15px_rgba(0,0,0,0.02)] dark:shadow-none">
          {qtyInCart > 0 ? (
            <div className="flex items-center justify-between w-full h-12 bg-slate-50 dark:bg-slate-800/50 border-2 border-[#00B4FF] rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => onUpdateQty(qtyInCart - 1)} className="w-12 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                <ClientIcon icon="ph:minus-bold" className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center text-lg font-black text-slate-900 dark:text-white">{qtyInCart}</span>
              <button onClick={() => onUpdateQty(qtyInCart + 1)} className="w-12 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="w-full h-12 rounded-xl bg-[#00B4FF] text-white text-sm font-black transition-all hover:bg-[#0070FF] active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              <ClientIcon icon="ph:shopping-cart-bold" className="w-4 h-4" />
              Add to Cart - ₹{pkg.price}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
