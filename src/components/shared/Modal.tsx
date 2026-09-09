"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientIcon } from "@/components/ui/ClientIcon";

/**
 * The bottom-sheet-on-mobile / centred-on-desktop shell that ~20 places in
 * this app had each hand-rolled with the same portal + backdrop recipe.
 * New surfaces use this instead of copying it again.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidthClass = "sm:max-w-md",
  bodyClassName = "p-4",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  bodyClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative bg-white dark:bg-[#0F172A] w-full ${maxWidthClass} rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate min-w-0">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors shrink-0"
            >
              <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col ${bodyClassName}`}>{children}</div>

        {footer && <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
