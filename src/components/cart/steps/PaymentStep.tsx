"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { PAYMENT_MODE_OPTIONS, type PaymentDetails, type PaymentMode } from "../checkoutTypes";

interface Props {
  payment: PaymentDetails;
  onChange: (payment: PaymentDetails) => void;
  amountDue: number;
}

const QR_SRC = "/images/handyzoqrcode.png";

export function PaymentStep({ payment, onChange, amountDue }: Props) {
  const [mounted, setMounted] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 sm:p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pay via UPI</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Scan the QR code with any UPI app, then confirm the payment below.
        </p>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm group bg-white"
        >
          <Image src={QR_SRC} alt="Scan to pay QR code" fill className="object-contain p-3" />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 flex items-center justify-center transition-colors">
            <ClientIcon
              icon="ph:magnifying-glass-plus-bold"
              className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Amount to pay</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₹{amountDue}</p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <ClientIcon icon="ph:hand-tap-bold" className="w-3.5 h-3.5" /> Tap QR to zoom in
        </span>
      </div>

      {/* Payment mode */}
      <div>
        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5 mb-1.5 block">Paid using</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <ClientIcon icon="ph:device-mobile-camera" className="w-4 h-4 text-slate-400" />
          </div>
          <select
            value={payment.mode}
            onChange={(e) => onChange({ ...payment, mode: e.target.value as PaymentMode })}
            className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select payment app
            </option>
            {PAYMENT_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <ClientIcon icon="ph:caret-down-bold" className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* UPI Ref */}
      <div>
        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5 mb-1.5 block">
          UPI ID / Transaction Reference No.
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <ClientIcon icon="ph:hash" className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={payment.upiRef}
            onChange={(e) => onChange({ ...payment, upiRef: e.target.value })}
            placeholder="e.g. 234567891234 or yourname@upi"
            className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Zoom modal */}
      {mounted &&
        zoomOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setZoomOpen(false)}
          >
            <div
              className="relative bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomOpen(false)}
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg"
              >
                <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
              </button>
              <div className="relative w-full aspect-square">
                <Image src={QR_SRC} alt="Scan to pay QR code" fill className="object-contain" />
              </div>
              <p className="text-center text-sm font-bold text-slate-900 mt-4">Scan to pay ₹{amountDue}</p>
              <p className="text-center text-xs text-slate-500 mt-1">Handyzo &middot; UPI</p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
