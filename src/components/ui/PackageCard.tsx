"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ClientIcon } from "./ClientIcon";
import { Service, ServicePackage } from "@/types/service";
import { useCart } from "@/context/CartContext";
import { PackageDetailsModal } from "@/components/services/PackageDetailsModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PackageCardProps {
  parentService: Service;
  pkg: ServicePackage;
}

export function PackageCard({ parentService, pkg }: PackageCardProps) {
  const { addToCart, updateQuantity, items } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();
  
  const handleAddToCart = () => {
    if (status === "unauthenticated") {
      toast.error("Please sign in first to add items to your cart");
      router.push("/sign-in");
      return;
    }
    addToCart(parentService, pkg);
  };
  
  const cartItemId = pkg.id;
  const qtyInCart = items.find((i) => i.id === cartItemId)?.quantity || 0;

  return (
    <>
      <div className="flex flex-col w-full bg-white dark:bg-[#0B1221] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 h-full group">
        
        {/* Top Image */}
        <div className="relative aspect-square w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <Image
            src={parentService.image}
            alt={pkg.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>

        {/* Details Section */}
        <div className="p-2 sm:p-3 flex flex-col flex-grow bg-white dark:bg-[#0B1221]">
          
          {/* Header */}
          <div className="mb-2">
            <h3 className="text-[11px] sm:text-[13px] font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
              {pkg.name}
            </h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[13px] sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">₹{pkg.price}</span>
              {pkg.originalPrice > pkg.price && (
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 line-through">₹{pkg.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <ClientIcon icon="ph:clock-fill" className="w-3 h-3 text-[#00B4FF]" />
              <span>{pkg.time}</span>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="mt-auto pt-2 flex flex-col gap-1.5">
            <div className="h-8 sm:h-9 w-full">
              {status === "authenticated" && qtyInCart > 0 ? (
                <div className="flex items-center justify-between w-full h-full bg-blue-50/50 dark:bg-blue-500/10 border border-[#00B4FF] rounded-lg overflow-hidden shadow-sm">
                  <button onClick={() => updateQuantity(cartItemId, qtyInCart - 1)} className="w-8 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                    <ClientIcon icon="ph:minus-bold" className="w-3 h-3" />
                  </button>
                  <span className="flex-1 text-center font-black text-slate-900 dark:text-white text-[10px] sm:text-xs">{qtyInCart}</span>
                  <button onClick={() => updateQuantity(cartItemId, qtyInCart + 1)} className="w-8 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                    <ClientIcon icon="ph:plus-bold" className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="w-full h-full rounded-lg bg-[#00B4FF] hover:bg-[#009EE0] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wide transition-all flex items-center justify-center shadow-sm"
                >
                  ADD
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full h-7 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-all flex items-center justify-center tracking-wide"
            >
              DETAILS
            </button>
          </div>
        </div>
      </div>

      <PackageDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={parentService}
        pkg={pkg}
        onAdd={handleAddToCart}
        qtyInCart={qtyInCart}
        onUpdateQty={(qty) => updateQuantity(cartItemId, qty)}
      />
    </>
  );
}
