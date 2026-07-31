"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { ServicePackage } from "@prisma/client";
import { packageToFormInput } from "./utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pkg: ServicePackage;
  serviceImage: string;
};

export function PackagePreviewModal({ isOpen, onClose, pkg, serviceImage }: Props) {
  const [mounted, setMounted] = useState(false);

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

  const data = packageToFormInput(pkg);
  const image = data.image || serviceImage;
  const discountPct = data.originalPrice > data.price && data.originalPrice > 0 ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : 0;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0B1221] w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
        <div className="relative w-full h-36 shrink-0 bg-slate-900">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          <button onClick={onClose} className="absolute top-3.5 right-3.5 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-slate-900 cursor-pointer">
            <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 p-4">
            {data.tag && <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">{data.tag}</span>}
            <h2 className="text-xl font-black text-white">{data.name}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{data.price}</span>
            {discountPct > 0 && (
              <>
                <span className="text-sm font-semibold text-slate-400 line-through">₹{data.originalPrice}</span>
                <span className="px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/20 rounded-lg">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Duration" value={data.time || "—"} />
            <Info label="Category" value={data.category || "—"} />
            <Info label="Rating" value={data.rating || "—"} />
            <Info label="Tag" value={data.tag || "—"} />
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Features</h3>
            <div className="flex flex-col gap-1.5">
              {data.features.map((f, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {data.details.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Details</h3>
              <div className="flex flex-col gap-1.5">
                {data.details.map((d, idx) => (
                  <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                    {idx + 1}. {d}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
