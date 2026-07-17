"use client";

import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export function CartButton() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Link href="/cart" className="relative flex p-1.5 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
      <ClientIcon icon="ph:shopping-bag" width="22" height="22" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#00B4FF] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

export function MobileCartMenuItem() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Link href="/cart" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group justify-between">
      <div className="flex items-center">
        <ClientIcon icon="ph:shopping-bag" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
        Cart
      </div>
      {mounted && totalItems > 0 && (
        <span className="bg-[#00B4FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
