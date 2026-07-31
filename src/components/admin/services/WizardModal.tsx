"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientIcon } from "@/components/ui/ClientIcon";

type Props = {
  isOpen: boolean;
  title: string;
  stepLabels: string[];
  currentStep: number;
  isLastStep: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
};

export function WizardModal({
  isOpen,
  title,
  stepLabels,
  currentStep,
  isLastStep,
  isSubmitting,
  submitLabel,
  onClose,
  onBack,
  onNext,
  onSubmit,
  children,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

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

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/75 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#0B1221] w-full sm:max-w-xl md:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[94vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 overflow-hidden border border-slate-200 dark:border-slate-800 z-10">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
            </button>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-1.5">
            {stepLabels.map((label, idx) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    idx <= currentStep ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide text-center hidden sm:block ${
                    idx === currentStep ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="sm:hidden text-center mt-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Step {currentStep + 1} of {stepLabels.length}: {stepLabels[currentStep]}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">{children}</div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3 bg-white dark:bg-[#0B1221]">
          <button
            type="button"
            onClick={currentStep === 0 ? onClose : onBack}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            onClick={isLastStep ? onSubmit : onNext}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-2"
          >
            {isSubmitting && <ClientIcon icon="svg-spinners:180-ring" className="w-4 h-4" />}
            {isLastStep ? submitLabel : "Next"}
            {!isLastStep && <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
