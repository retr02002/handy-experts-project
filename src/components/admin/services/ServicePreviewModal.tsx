"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { ServiceWithPackages } from "./utils";
import { serviceToFormInput } from "./utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceWithPackages;
};

export function ServicePreviewModal({ isOpen, onClose, service }: Props) {
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

  const data = serviceToFormInput(service);

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0B1221] w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
        <div className="relative w-full h-40 shrink-0 bg-slate-900">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${data.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          <button onClick={onClose} className="absolute top-3.5 right-3.5 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-slate-900 cursor-pointer">
            <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 p-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">{data.category}</span>
            <h2 className="text-xl font-black text-white">{data.title}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Slug" value={data.slug} />
            <Info label="Rating" value={data.rating || "—"} />
            <Info label="Time" value={data.time || "—"} />
            <Info label="Warranty" value={data.warranty || "—"} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.description}</p>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Packages ({service.packages.length})</h3>
            <div className="flex flex-col gap-2">
              {service.packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{pkg.name}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{pkg.price}</span>
                </div>
              ))}
              {service.packages.length === 0 && <p className="text-sm text-slate-400">No packages yet.</p>}
            </div>
          </div>

          {data.benefits.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Benefits</h3>
              <div className="flex flex-col gap-2">
                {data.benefits.map((b, idx) => (
                  <div key={idx} className="flex gap-2.5">
                    <ClientIcon icon={b.icon || "ph:check-circle"} className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{b.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.howItWorks.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">How It Works</h3>
              <div className="flex flex-col gap-2">
                {data.howItWorks.map((s, idx) => (
                  <div key={idx} className="flex gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-black flex items-center justify-center shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.faqs.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">FAQs</h3>
              <div className="flex flex-col gap-2">
                {data.faqs.map((f, idx) => (
                  <details key={idx} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                    <summary className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">{f.question}</summary>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{f.answer}</p>
                  </details>
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
