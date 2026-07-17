"use client";

import React from "react";
import { CartItem, useCart } from "@/context/CartContext";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface CartItemCardProps {
  item: CartItem;
  isSavedItem?: boolean;
}

export function CartItemCard({ item, isSavedItem = false }: CartItemCardProps) {
  const { updateQuantity, removeFromCart, saveForLater, moveToCart, removeFromSaved } = useCart();

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.15)] transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Top Section: Icon, Text, and Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <ClientIcon icon="ph:package" className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {item.pkg.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {item.serviceTitle}
            </p>
          </div>
        </div>

        {/* Price Section */}
        <div className="text-right shrink-0">
          <p className="text-sm font-black text-slate-900 dark:text-white">
            ₹{item.pkg.price}
          </p>
          {item.pkg.originalPrice > item.pkg.price && (
            <p className="text-[10px] text-slate-400 line-through">
              ₹{item.pkg.originalPrice}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section: Controls */}
      <div className="flex items-center justify-between pl-0 sm:pl-[60px]">
        {!isSavedItem ? (
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center bg-slate-50 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-700/60 rounded-full px-1 py-0.5">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
              >
                <ClientIcon icon="ph:minus-bold" className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
              >
                <ClientIcon icon="ph:plus-bold" className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => saveForLater(item.id)}
                className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title="Save for later"
              >
                <ClientIcon icon="ph:bookmark-simple" className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeFromCart(item.id)}
                className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                title="Remove item"
              >
                <ClientIcon icon="ph:trash" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
             <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
               Qty: {item.quantity}
             </span>
             <div className="flex items-center gap-2">
              <button
                onClick={() => moveToCart(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 transition-colors"
                title="Move to cart"
              >
                <ClientIcon icon="ph:shopping-cart" className="w-3.5 h-3.5" />
                Move to Cart
              </button>
              <button
                onClick={() => removeFromSaved(item.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                title="Remove item"
              >
                <ClientIcon icon="ph:trash" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
