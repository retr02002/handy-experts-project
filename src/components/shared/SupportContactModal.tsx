"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Modal } from "./Modal";

/**
 * Escalation path for whoever is looking at a job — the vendor running it.
 * Both the customer and the technician get the same card; only the framing
 * copy differs.
 */
export function SupportContactModal({
  vendorName,
  vendorPhone,
  vendorEmail,
  onClose,
}: {
  vendorName: string | null;
  vendorPhone: string | null;
  vendorEmail: string | null;
  onClose: () => void;
}) {
  const hasContact = !!(vendorPhone || vendorEmail);

  return (
    <Modal title="Need help?" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center shrink-0">
            <ClientIcon icon="ph:headset-fill" className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {vendorName ?? "Your service provider"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              They&apos;re handling this job and can sort out anything that goes wrong.
            </p>
          </div>
        </div>

        {hasContact ? (
          <div className="flex flex-col gap-2">
            {vendorPhone && (
              <a
                href={`tel:${vendorPhone}`}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors"
              >
                <ClientIcon icon="ph:phone-fill" className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Call</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{vendorPhone}</p>
                </div>
              </a>
            )}
            {vendorEmail && (
              <a
                href={`mailto:${vendorEmail}`}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors"
              >
                <ClientIcon icon="ph:envelope-simple-fill" className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Email</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{vendorEmail}</p>
                </div>
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            This provider hasn&apos;t added contact details yet.
          </p>
        )}
      </div>
    </Modal>
  );
}
