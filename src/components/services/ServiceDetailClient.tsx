"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Service, ServicePackage } from "@/data/mockServices";
import { useCart } from "@/context/CartContext";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { PackageDetailsModal } from "./PackageDetailsModal";

const getPackageIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('ac')) return 'ph:wind-duotone';
  if (lowerName.includes('clean') || lowerName.includes('wash')) return 'ph:sparkle-duotone';
  if (lowerName.includes('install') || lowerName.includes('mount')) return 'ph:wrench-duotone';
  if (lowerName.includes('repair')) return 'ph:hammer-duotone';
  if (lowerName.includes('gas') || lowerName.includes('recharge')) return 'ph:gas-can-duotone';
  return 'ph:package-duotone';
};

export function ServiceDetailClient({ service }: { service: Service }) {
  const { items, addToCart, updateQuantity, totalPrice, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<ServicePackage | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const getQty = (pkgName: string) => {
    return items.find((i) => i.id === `${service.id}-${pkgName}`)?.quantity || 0;
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0B1221] min-h-screen pb-32 lg:pb-10 -mt-20 sm:-mt-24">

      {/* Immersive Full-Bleed Hero */}
      <div className="relative w-full h-[460px] sm:h-[480px] md:h-[540px]">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover"
          priority
        />
        {/* Premium dark gradient overlay for perfect text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/10"></div>

        {/* Increased padding-bottom so content never touches the overlapping tabs */}
        <div className="absolute inset-0 flex flex-col justify-end pt-32 pb-16 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-4">

            {/* Premium Category Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] shadow-[0_0_8px_rgba(0,180,255,0.8)]"></span>
              {service.category}
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-lg max-w-3xl">
              {service.title}
            </h1>

            <p className="text-slate-200 max-w-2xl text-sm sm:text-base leading-relaxed drop-shadow-md">
              {service.description}
            </p>

            {/* Senior UI/UX Inline Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-2">
              <div className="flex items-center gap-2">
                <ClientIcon icon="ph:star-fill" className="w-5 h-5 text-orange-400" />
                <span className="text-white text-sm sm:text-base font-semibold">{service.rating} Rating</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30"></div>
              <div className="flex items-center gap-2">
                <ClientIcon icon="ph:clock-fill" className="w-5 h-5 text-[#00B4FF]" />
                <span className="text-white text-sm sm:text-base font-semibold">{service.time}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30"></div>
              <div className="flex items-center gap-2">
                <ClientIcon icon="ph:shield-check-fill" className="w-5 h-5 text-emerald-400" />
                <span className="text-white text-sm sm:text-base font-semibold">{service.warranty}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Unique Tabs (Non-sticky) - Perfectly overlapping the empty hero space */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1.5 sm:gap-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none w-full sm:w-fit mx-auto sm:mx-0">
          {[
            { id: 'packages', icon: 'ph:package-duotone', label: 'Packages' },
            { id: 'benefits', icon: 'ph:sparkle-duotone', label: 'Benefits' },
            { id: 'how-it-works', icon: 'ph:git-commit-duotone', label: 'Process' },
            { id: 'faqs', icon: 'ph:question-duotone', label: 'FAQs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-lg bg-slate-50 sm:bg-transparent hover:bg-slate-100 sm:hover:bg-slate-50 dark:bg-slate-700/30 sm:dark:bg-transparent dark:hover:bg-slate-700/50 transition-colors border border-slate-100 sm:border-transparent dark:border-slate-700 sm:dark:border-transparent"
            >
              <ClientIcon icon={tab.icon} className="w-4 h-4 text-[#00B4FF] sm:text-slate-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

        {/* Left Column */}
        <div className="flex-1 w-full lg:max-w-[65%] flex flex-col gap-10">

          {/* Packages Section */}
          <section id="packages" className="scroll-mt-10">
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center space-x-2 text-[#00B4FF] font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-3">
                <span>01</span>
                <span className="w-4 h-px bg-[#00B4FF]"></span>
                <span>Pricing</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Select a Package
              </h2>
            </div>
            <div className="flex flex-col gap-5">
              {service.packages.map((pkg, idx) => {
                const qty = getQty(pkg.name);
                const pkgIcon = getPackageIcon(pkg.name);

                return (
                  <div
                    key={idx}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#00B4FF]/30 dark:hover:border-[#00B4FF]/30 transition-all duration-300 flex flex-col lg:flex-row overflow-hidden"
                  >
                    {/* Subtle glow background effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00B4FF]/5 to-transparent dark:from-[#00B4FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    {/* Left Section: Info & Features */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col relative z-10">
                      {/* Top Row: Title & Badge */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100/50 dark:border-blue-500/20">
                             <ClientIcon icon={pkgIcon} className="w-6 h-6 text-[#00B4FF]" />
                           </div>
                           <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                             {pkg.name}
                           </h3>
                        </div>
                        {/* Mobile Badge (hidden on lg, moved to right panel) */}
                        {pkg.originalPrice > pkg.price && (
                          <div className="lg:hidden shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide mt-1 border border-emerald-100 dark:border-emerald-500/20">
                            Save ₹{pkg.originalPrice - pkg.price}
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
                        {pkg.features.map((feature, fIdx) => {
                          const icons = ["ph:wrench-duotone", "ph:shield-check-duotone", "ph:sparkle-duotone", "ph:check-circle-duotone", "ph:medal-duotone"];
                          const featureIcon = icons[fIdx % icons.length];
                          return (
                            <div key={fIdx} className="flex items-center gap-3 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                              <ClientIcon icon={featureIcon} className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span className="flex-1 leading-snug">{feature}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Section: Price & Actions */}
                    <div className="w-full lg:w-[320px] shrink-0 bg-slate-50/50 dark:bg-slate-800/20 border-t-2 border-dashed lg:border-t-0 lg:border-l-2 border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 flex flex-col justify-center relative z-10">
                      
                      {/* Ticket Cutouts (Mobile: left/right on top border. Desktop: top/bottom on left border) */}
                      {/* Mobile Left Cutout */}
                      <div className="lg:hidden absolute top-0 -left-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full transform -translate-y-1/2 border-r border-slate-200 dark:border-slate-800/80"></div>
                      {/* Mobile Right Cutout */}
                      <div className="lg:hidden absolute top-0 -right-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full transform -translate-y-1/2 border-l border-slate-200 dark:border-slate-800/80"></div>
                      {/* Desktop Top Cutout */}
                      <div className="hidden lg:block absolute top-0 -left-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full transform -translate-y-1/2 border-b border-slate-200 dark:border-slate-800/80"></div>
                      {/* Desktop Bottom Cutout */}
                      <div className="hidden lg:block absolute bottom-0 -left-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full transform translate-y-1/2 border-t border-slate-200 dark:border-slate-800/80"></div>

                      {/* Price & Badge */}
                      <div className="flex flex-col gap-1.5 mb-6 relative z-10">
                         {pkg.originalPrice > pkg.price && (
                           <div className="hidden lg:inline-flex self-start bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border border-emerald-100 dark:border-emerald-500/20 mb-2">
                             Save ₹{pkg.originalPrice - pkg.price}
                           </div>
                         )}
                         <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black text-[#00B4FF] tracking-tight">₹{pkg.price}</span>
                           <span className="text-sm font-medium text-slate-400 line-through">₹{pkg.originalPrice}</span>
                         </div>
                         <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                           <ClientIcon icon="ph:clock-duotone" className="w-3.5 h-3.5" />
                           Takes ~{pkg.time || "45 mins"}
                         </span>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-row gap-3 mt-auto relative z-10">
                        <button
                          onClick={() => setSelectedPkg(pkg)}
                          className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#00B4FF] hover:border-[#00B4FF]/30 transition-all flex items-center justify-center gap-1 text-[12px] sm:text-[13px] shadow-sm whitespace-nowrap px-2"
                        >
                          View Details
                          <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        <div className="flex-1 h-11 relative z-10">
                          {mounted && qty > 0 ? (
                            <div className="flex items-center justify-between w-full h-full bg-blue-50/50 dark:bg-blue-500/10 border-2 border-[#00B4FF] rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,180,255,0.15)]">
                              <button onClick={() => updateQuantity(`${service.id}-${pkg.name}`, qty - 1)} className="w-11 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                                <ClientIcon icon="ph:minus-bold" className="w-4 h-4" />
                              </button>
                              <span className="flex-1 text-center font-black text-slate-900 dark:text-white text-[15px]">{qty}</span>
                              <button onClick={() => updateQuantity(`${service.id}-${pkg.name}`, qty + 1)} className="w-11 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                                <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(service, pkg)}
                              className="group/btn relative w-full h-full rounded-xl bg-gradient-to-r from-[#00B4FF] to-[#0080FF] text-white text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(0,180,255,0.6)] hover:shadow-[0_8px_25px_-5px_rgba(0,180,255,0.8)] overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                              <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                                ADD <ClientIcon icon="ph:shopping-cart-bold" className="w-4 h-4 shrink-0" />
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Benefits Section */}
          {service.benefits && (
            <section id="benefits" className="scroll-mt-10">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 text-[#00B4FF] font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-3">
                  <span>02</span>
                  <span className="w-4 h-px bg-[#00B4FF]"></span>
                  <span>Benefits</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Why Choose Us
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {service.benefits.map((benefit, idx) => (
                  <div key={idx} className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-[#00B4FF]/30 backdrop-blur-sm overflow-hidden flex flex-col gap-3 sm:gap-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00B4FF]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#00B4FF] border border-blue-100/50 dark:border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      <ClientIcon icon={benefit.icon} className="w-6 h-6" />
                    </div>
                    <div className="relative z-10 pt-1">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1.5 group-hover:text-[#00B4FF] transition-colors">{benefit.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* How it Works Section */}
          {service.howItWorks && (
            <section id="how-it-works" className="scroll-mt-10">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 text-[#00B4FF] font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-3">
                  <span>03</span>
                  <span className="w-4 h-px bg-[#00B4FF]"></span>
                  <span>Process</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  How it Works
                </h2>
              </div>
              <div className="bg-white dark:bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-10 bottom-10 left-[43px] sm:left-[55px] w-[2px] bg-slate-200 dark:bg-slate-800/60"></div>
                <div className="flex flex-col gap-8 sm:gap-10">
                  {service.howItWorks.map((step, idx) => (
                    <div key={idx} className="flex flex-row gap-5 relative z-10 group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#0f1629] border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-base sm:text-lg font-black text-slate-400 group-hover:text-[#00B4FF] group-hover:border-[#00B4FF] group-hover:shadow-[0_0_15px_rgba(0,180,255,0.3)] shrink-0 shadow-sm transition-all duration-300">
                        {step.step}
                      </div>
                      <div className="pt-1 sm:pt-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1.5 group-hover:text-[#00B4FF] transition-colors">{step.title}</h3>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FAQs Section */}
          {service.faqs && (
            <section id="faqs" className="scroll-mt-10">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 text-[#00B4FF] font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-3">
                  <span>04</span>
                  <span className="w-4 h-px bg-[#00B4FF]"></span>
                  <span>Support</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  FAQs
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {service.faqs.map((faq, idx) => (
                  <details key={idx} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm hover:shadow-md dark:shadow-none transition-all duration-300 group [&_summary::-webkit-details-marker]:hidden backdrop-blur-sm">
                    <summary className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none">
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pr-4 group-hover:text-[#00B4FF] transition-colors">{faq.question}</span>
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 group-open:rotate-180 transition-all duration-300 group-open:text-white group-open:bg-[#00B4FF] group-hover:bg-[#00B4FF]/10 group-hover:text-[#00B4FF]">
                        <ClientIcon icon="ph:caret-down-bold" className="w-4 h-4" />
                      </div>
                    </summary>
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Clean Sticky Cart Sidebar */}
        <div className="hidden lg:block w-[35%] shrink-0 sticky top-6 z-10">
          <div className="bg-white dark:bg-[#0B1221] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#00B4FF]/10 flex items-center justify-center text-[#00B4FF]">
                <ClientIcon icon="ph:shopping-cart-duotone" className="w-4 h-4" />
              </div>
              Your Cart
            </h3>

            {!mounted || items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 text-slate-300 dark:text-slate-500 shadow-sm">
                  <ClientIcon icon="ph:shopping-bag-open-duotone" className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">Select a package to continue.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.pkg.name}</span>
                      <span className="text-sm font-black text-[#00B4FF]">₹{item.pkg.price}</span>
                    </div>
                    <div className="flex items-center justify-between w-20 h-8 bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shrink-0 shadow-sm">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-full flex items-center justify-center text-slate-500 hover:text-[#00B4FF] hover:bg-slate-50 transition-colors">
                        <ClientIcon icon="ph:minus-bold" className="w-3 h-3" />
                      </button>
                      <span className="flex-1 text-center text-xs font-black text-slate-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-full flex items-center justify-center text-slate-500 hover:text-[#00B4FF] hover:bg-slate-50 transition-colors">
                        <ClientIcon icon="ph:plus-bold" className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mounted && items.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">₹{totalPrice}</span>
                </div>
                <Link href="/cart" className="w-full flex items-center justify-center h-12 rounded-xl bg-[#00B4FF] text-white text-sm font-black transition-all hover:bg-[#0070FF] shadow-sm active:scale-95">
                  Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      {mounted && items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[84px] bg-white/95 dark:bg-[#0B1221]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.4)] z-40">
          <div className="flex items-center justify-between max-w-lg mx-auto gap-3">
            <div className="flex flex-col flex-1 shrink-0">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
              <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">₹{totalPrice}</span>
            </div>
            <Link href="/cart" className="w-[140px] h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4FF] to-blue-600 text-white text-[13px] font-black shadow-sm active:scale-95 transition-transform">
              View Cart
            </Link>
          </div>
        </div>
      )}

      {/* MODAL */}
      {selectedPkg && (
        <PackageDetailsModal
          isOpen={!!selectedPkg}
          onClose={() => setSelectedPkg(null)}
          service={service}
          pkg={selectedPkg}
          onAdd={() => {
            addToCart(service, selectedPkg);
            setSelectedPkg(null);
          }}
          qtyInCart={getQty(selectedPkg.name)}
          onUpdateQty={(newQty) => updateQuantity(`${service.id}-${selectedPkg.name}`, newQty)}
        />
      )}
    </div>
  );
}
