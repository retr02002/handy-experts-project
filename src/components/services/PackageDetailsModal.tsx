"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  // Safely set mounted state on client hydration without triggering synchronous cascading renders
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync body scroll lock with modal open state
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

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/75 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Backdrop area trigger to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Window Container */}
      <div className="relative bg-white dark:bg-[#0B1221] w-full sm:max-w-lg md:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 overflow-hidden border border-slate-200 dark:border-slate-800 z-10">

        {/* High-Contrast Floating Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-900/80 text-white dark:bg-white/90 dark:text-slate-900 shadow-lg border-2 border-white/20 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
        </button>

        {/* Compact Image Header with Gradient & Title */}
        <div className="relative w-full h-[140px] sm:h-[170px] shrink-0 bg-slate-900 overflow-hidden">
          <Image
            src={pkg.image || service.image}
            alt={pkg.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/20"></div>

          <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 flex flex-col justify-end z-10 pr-16">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00B4FF] mb-1 flex items-center gap-1">
              <ClientIcon icon="ph:seal-check-fill" className="w-3.5 h-3.5" />
              <span>Package Specifications</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md pr-4">{pkg.name}</h2>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6 sm:space-y-7">

          {/* Pricing & Savings Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{pkg.price}
            </span>
            {pkg.originalPrice > pkg.price && (
              <>
                <span className="text-sm sm:text-base font-semibold text-slate-400 line-through">₹{pkg.originalPrice}</span>
                <span className="px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/20 rounded-lg border border-emerald-300/50 dark:border-emerald-500/30 uppercase tracking-wider shadow-2xs">
                  Save ₹{pkg.originalPrice - pkg.price}
                </span>
              </>
            )}
          </div>

          {/* Duration & Warranty Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-500/30">
                <ClientIcon icon="ph:clock-duotone" className="w-5 h-5 text-[#00B4FF]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Duration</span>
                <span className="text-sm font-black text-slate-900 dark:text-white truncate">{pkg.time || "45 mins"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-500/30">
                <ClientIcon icon="ph:shield-check-duotone" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Warranty</span>
                <span className="text-sm font-black text-slate-900 dark:text-white truncate">{service.warranty || "30-Day Shield"}</span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
              What&apos;s Included in this package
            </h3>
            <div className="flex flex-col gap-2.5 bg-slate-50/70 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {(pkg.details || pkg.features).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-150 dark:border-slate-800" />

          {/* Service Process Timeline */}
          {service.howItWorks && (
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Service Execution Protocol
              </h3>
              <div className="flex flex-col relative pl-2">
                <div className="absolute left-[13px] top-2 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800" />
                {service.howItWorks.map((step, idx) => (
                  <div key={idx} className="flex gap-3.5 relative z-10 mb-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-[#0f172a] border-[3px] border-[#00B4FF] flex items-center justify-center text-[11px] font-black text-[#00B4FF] shrink-0 shadow-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className="pt-0.5 pb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{step.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className="border-slate-150 dark:border-slate-800" />

          {/* Handy Experts Promise Guarantee */}
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Our Service Guarantee
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl flex gap-3 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <ClientIcon icon="ph:shield-check-fill" className="w-5 h-5 text-[#00B4FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">30-Day Guarantee</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">If the issue recurs within 30 days, we return and fix it at no extra charge.</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl flex gap-3 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <ClientIcon icon="ph:user-circle-gear-fill" className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Verified & Vetted Experts</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Background-checked, skilled professionals with industry certifications on every booking.</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl flex gap-3 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <ClientIcon icon="ph:receipt-fill" className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Transparent Upfront Quote</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Receive a crystal clear diagnosis and repair estimate before any work begins.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-150 dark:border-slate-800" />

          {/* Customer Reviews */}
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Customer Experiences
            </h3>

            {/* Rating Breakdown */}
            <div className="mb-5 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ClientIcon icon="ph:star-fill" className="text-amber-400 w-7 h-7" />
                  4.8
                </span>
                <span className="text-xs sm:text-sm text-slate-500 font-bold mb-1">Verified customer ratings</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { stars: 5, pct: 78 },
                  { stars: 4, pct: 21 },
                  { stars: 3, pct: 1 },
                  { stars: 2, pct: 0 },
                  { stars: 1, pct: 0 },
                ].map(row => (
                  <div key={row.stars} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-2.5">{row.stars}</span>
                    <ClientIcon icon="ph:star-fill" className="w-3 h-3 text-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }}></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 w-7 text-right">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Testimonials */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-black text-xs flex items-center justify-center">CR</div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">Chandrika Rathore</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <ClientIcon key={i} icon="ph:star-fill" className="w-2.5 h-2.5 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">Verified</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  &quot;Impeccable quality! The technicians arrived on time, used professional grade eco-friendly solutions, and completely eradicated tough stains. Highly recommend!&quot;
                </p>
              </div>

              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 font-black text-xs flex items-center justify-center">PS</div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">Pankaj Sastry</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <ClientIcon key={i} icon="ph:star-fill" className="w-2.5 h-2.5 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">Verified</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  &quot;Transparent upfront quote with zero hidden charges. Excellent craftsmanship and spotless cleanup afterwards!&quot;
                </p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          {service.faqs && (
            <>
              <hr className="border-slate-150 dark:border-slate-800" />
              <div className="pb-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Frequently Asked Questions
                </h3>
                <div className="flex flex-col gap-2">
                  {service.faqs.slice(0, 3).map((faq, idx) => (
                    <details key={idx} className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs group [&_summary::-webkit-details-marker]:hidden">
                      <summary className="w-full text-left p-3.5 flex items-center justify-between gap-3 cursor-pointer focus:outline-none">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 pr-2">{faq.question}</span>
                        <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 text-slate-400 group-open:rotate-180 transition-transform duration-300 group-open:text-[#00B4FF] shadow-2xs">
                          <ClientIcon icon="ph:caret-down-bold" className="w-3 h-3" />
                        </div>
                      </summary>
                      <div className="px-3.5 pb-3.5 text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60 mt-1">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer Actions - Always Above Content */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0B1221] z-20">
          {qtyInCart > 0 ? (
            <div className="flex items-center justify-between w-full h-12 bg-blue-50/80 dark:bg-[#101E38] border-2 border-[#00B4FF] rounded-xl overflow-hidden shadow-md px-2">
              <button onClick={() => onUpdateQty(qtyInCart - 1)} className="w-10 h-full flex items-center justify-center text-[#00B4FF] hover:opacity-70 transition-opacity">
                <ClientIcon icon="ph:minus-bold" className="w-4 h-4 stroke-[2px]" />
              </button>
              <span className="flex-1 text-center text-base font-black text-slate-900 dark:text-white">{qtyInCart} in cart</span>
              <button onClick={() => onUpdateQty(qtyInCart + 1)} className="w-10 h-full flex items-center justify-center text-[#00B4FF] hover:opacity-70 transition-opacity">
                <ClientIcon icon="ph:plus-bold" className="w-4 h-4 stroke-[2px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00B4FF] to-[#0070FF] hover:from-[#00A0E0] hover:to-[#005AD5] text-white text-sm sm:text-base font-black transition-all shadow-[0_6px_20px_rgba(0,180,255,0.25)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClientIcon icon="ph:shopping-cart-bold" className="w-5 h-5" />
              <span>Add to Cart - ₹{pkg.price}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
