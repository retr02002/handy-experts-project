"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Service, ServicePackage } from "@/types/service";
import { useCart } from "@/context/CartContext";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { PackageDetailsModal } from "./PackageDetailsModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ServicePackageCardProps {
  service: Service;
  pkg: ServicePackage;
  idx: number;
  catIdx: number;
}

export function ServicePackageCard({ service, pkg, idx, catIdx }: ServicePackageCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const qty = items.find((i) => i.id === pkg.id)?.quantity || 0;
  const displayImage = pkg.image || service.image;
  const badgeTag = pkg.tag || (idx === 0 && catIdx === 0 ? "Bestseller" : undefined);

  const handleAddToCart = () => {
    if (status === "unauthenticated") {
      toast.error("Please sign in first to add items to your cart");
      router.push("/sign-in");
      return;
    }
    addToCart(service, pkg);
    toast.success(`Added ${pkg.name} to cart`);
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0E172B] rounded-[22px] sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_38px_rgba(0,180,255,0.12)] hover:border-[#00B4FF]/60 dark:hover:border-[#00B4FF]/50 transition-all duration-300 relative group/card flex flex-col gap-3 sm:gap-4 w-full min-w-0 overflow-hidden">
        {/* Ambient radial glow on hover */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00B4FF]/5 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none group-hover/card:from-[#00B4FF]/14 transition-all duration-500"></div>

        {/* TIER 1: TOP ROW (Title, Badges & Price opposite to Photo & ADD Button) */}
        <div className="flex flex-row items-start justify-between gap-3 sm:gap-6 w-full min-w-0 relative z-10">

          {/* Left Column: Details & Pricing */}
          <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0 text-left">

            {/* Badges & Rating Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {badgeTag && (
                <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-2xs">
                  {badgeTag}
                </span>
              )}
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-500/25 shadow-2xs">
                <ClientIcon icon="ph:star-fill" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{pkg.rating || "4.8 (1,240)"}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white group-hover/card:text-[#00B4FF] transition-colors leading-snug break-words mt-0.5">
              {pkg.name}
            </h3>

            {/* Price & Duration */}
            <div className="flex items-baseline gap-1.5 sm:gap-2.5 my-0.5 flex-wrap">
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹{pkg.price}</span>
              {pkg.originalPrice > pkg.price && (
                <>
                  <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">₹{pkg.originalPrice}</span>
                  <span className="text-[10px] sm:text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-500/25 shadow-2xs">
                    • Save ₹{pkg.originalPrice - pkg.price}
                  </span>
                </>
              )}
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 ml-0.5 flex items-center gap-1">
                <ClientIcon icon="ph:clock-duotone" className="w-3.5 h-3.5 text-[#00B4FF]" />
                <span>{pkg.time || "45 mins"}</span>
              </span>
            </div>
          </div>

          {/* Right Column: NATIVE APP THUMBNAIL + ICONIC OVERLAPPING ADD BUTTON */}
          <div className="w-[102px] sm:w-[136px] md:w-[140px] flex flex-col items-center sm:items-end shrink-0 relative mt-0.5 sm:mt-0 z-10">

            {/* Image Thumbnail */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-md relative border border-slate-200/90 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 shrink-0 group-hover/card:shadow-lg transition-all duration-300">
              <Image
                src={displayImage}
                alt={pkg.name}
                fill
                className="object-cover group-hover/card:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
            </div>

            {/* Overlapping ADD Button */}
            <div className="-mt-4 sm:-mt-5 z-20 w-22 sm:w-28 mx-auto sm:mx-3">
              {mounted && status === "authenticated" && qty > 0 ? (
                <div className="h-8 sm:h-10 bg-blue-50 dark:bg-[#101E38] border-2 border-[#00B4FF] rounded-xl flex items-center justify-between px-1.5 sm:px-2 shadow-lg font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                  <button
                    onClick={() => updateQuantity(pkg.id, qty - 1)}
                    className="w-5 sm:w-7 h-full flex items-center justify-center text-[#00B4FF] hover:opacity-70 transition-opacity"
                  >
                    <ClientIcon icon="ph:minus-bold" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={() => updateQuantity(pkg.id, qty + 1)}
                    className="w-5 sm:w-7 h-full flex items-center justify-center text-[#00B4FF] hover:opacity-70 transition-opacity"
                  >
                    <ClientIcon icon="ph:plus-bold" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full h-8 sm:h-10 bg-white dark:bg-[#0E172B] text-[#00B4FF] dark:text-[#38bdf8] border-2 border-slate-200/90 dark:border-slate-700/90 hover:border-[#00B4FF] dark:hover:border-[#00B4FF] font-black text-xs sm:text-[13px] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.4)] flex items-center justify-center gap-0.5 sm:gap-1 uppercase tracking-wider hover:bg-gradient-to-r hover:from-[#00B4FF] hover:to-[#0070FF] hover:text-white dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <span>ADD</span>
                  <ClientIcon icon="ph:plus-bold" className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2px]" />
                </button>
              )}
            </div>

            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1.5 sm:mt-2 font-bold text-center w-full truncate flex items-center justify-center gap-0.5">
              <ClientIcon icon="ph:seal-check-fill" className="w-3 h-3 text-[#00B4FF]" />
              <span>Verified package</span>
            </span>
          </div>
        </div>

        {/* TIER 2: FULL-WIDTH INCLUSIONS & SPECS BOX */}
        <div className="w-full bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2 relative z-10">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {pkg.features.map((feat, fIdx) => (
              <div key={fIdx} className="flex items-start gap-2 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug break-words">{feat}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-1 sm:mt-1.5 pt-2 sm:pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-xs sm:text-[13px] font-black text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group/btn cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <ClientIcon icon="ph:sparkle-fill" className="w-3.5 h-3.5 text-purple-500" />
              <span>View package specifications & inclusions</span>
            </span>
            <span className="flex items-center gap-0.5 uppercase tracking-wider text-[11px] bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-lg border border-purple-200/60 dark:border-purple-800/60">
              <span>Details</span>
              <ClientIcon icon="ph:caret-right-bold" className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* PACKAGE DETAILS MODAL */}
      {isModalOpen && (
        <PackageDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={service}
          pkg={pkg}
          onAdd={() => {
            handleAddToCart();
            setIsModalOpen(false);
          }}
          qtyInCart={qty}
          onUpdateQty={(newQty) => updateQuantity(pkg.id, newQty)}
        />
      )}
    </>
  );
}
