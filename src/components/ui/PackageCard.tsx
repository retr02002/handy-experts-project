"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ClientIcon } from "./ClientIcon";
import { Service, ServicePackage } from "@/data/mockServices";
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
  
  const cartItemId = `${parentService.id}-${pkg.name}`;
  const qtyInCart = items.find((i) => i.id === cartItemId)?.quantity || 0;

  return (
    <>
      <div className="flex flex-col w-full bg-white dark:bg-[#0B1221] rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 h-full group">
        
        {/* Top Image */}
        <div className="relative h-44 w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <Image
            src={parentService.image}
            alt={pkg.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
          
          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/90 dark:bg-black/60 backdrop-blur-md text-slate-900 dark:text-white shadow-sm">
              {parentService.category}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-5 flex flex-col flex-grow bg-white dark:bg-[#0B1221]">
          
          {/* Header */}
          <div className="mb-3">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1 block">
              {parentService.title}
            </span>
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
              {pkg.name}
            </h3>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              <ClientIcon icon="ph:clock-fill" className="w-3.5 h-3.5 text-[#00B4FF]" />
              {pkg.time}
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              <ClientIcon icon="ph:star-fill" className="w-3.5 h-3.5 text-orange-400" />
              {parentService.rating}
            </div>
          </div>

          {/* Features */}
          <div className="mb-5 flex-grow">
            <ul className="space-y-2">
              {pkg.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-snug">
                  <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 text-emerald-500 shrink-0 mt-[2px]" />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Action Area */}
          <div className="mt-auto flex flex-col gap-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹{pkg.price}</span>
              <span className="text-sm font-semibold text-slate-400 line-through">₹{pkg.originalPrice}</span>
            </div>
            
            {/* Buttons Row */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center"
              >
                View Details
              </button>
              
              <div className="flex-1 shrink-0">
                {status === "authenticated" && qtyInCart > 0 ? (
                  <div className="flex items-center justify-between w-full h-11 bg-blue-50/50 dark:bg-blue-500/10 border border-[#00B4FF] rounded-xl overflow-hidden shadow-sm">
                    <button onClick={() => updateQuantity(cartItemId, qtyInCart - 1)} className="w-10 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                      <ClientIcon icon="ph:minus-bold" className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-black text-slate-900 dark:text-white text-sm">{qtyInCart}</span>
                    <button onClick={() => updateQuantity(cartItemId, qtyInCart + 1)} className="w-10 h-full flex items-center justify-center text-[#00B4FF] hover:bg-[#00B4FF]/10 transition-colors">
                      <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleAddToCart}
                    className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#009EE0] text-white text-[13px] font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
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
