"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { updateJobItemsAction, type JobItemInput } from "@/actions/servicecall.actions";
import type { LiveCallItemDetail } from "@/actions/livecall.actions";

const TAX_RATE = 0.18;

interface EditableItem extends JobItemInput {
  /** Stable across re-renders so React keys survive reordering/removal. */
  key: string;
}

function toEditable(items: LiveCallItemDetail[]): EditableItem[] {
  return items.map((i, idx) => ({
    key: `existing-${idx}`,
    packageId: null,
    packageName: i.packageName,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
  }));
}

/**
 * Lets a vendor correct what a job covers before work starts — the customer
 * described one thing on the phone and the technician found another.
 *
 * The customer has already paid, so the difference is shown explicitly
 * rather than the total quietly changing underneath them. The server is what
 * actually enforces the before-work-starts rule; this only hides the button.
 */
export function JobItemsEditor({
  serviceCallId,
  items,
  paidTotal,
  onClose,
  onSaved,
}: {
  serviceCallId: string;
  items: LiveCallItemDetail[];
  /** What the customer was originally charged. */
  paidTotal: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<EditableItem[]>(toEditable(items));
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: string, patch: Partial<EditableItem>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const remove = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const add = () =>
    setRows((prev) => [
      ...prev,
      { key: `new-${Date.now()}`, packageId: null, packageName: "", unitPrice: 0, quantity: 1 },
    ]);

  const subtotal = rows.reduce((sum, r) => sum + (r.unitPrice || 0) * (r.quantity || 0), 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const difference = total - paidTotal;

  const save = async () => {
    const cleaned = rows
      .map((r) => ({
        packageId: r.packageId,
        packageName: r.packageName.trim(),
        unitPrice: Number(r.unitPrice) || 0,
        quantity: Number(r.quantity) || 0,
      }))
      .filter((r) => r.packageName.length > 0);

    if (cleaned.length === 0) {
      toast.error("A job needs at least one service on it");
      return;
    }
    if (cleaned.some((r) => r.quantity < 1)) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateJobItemsAction(serviceCallId, cleaned);
      if (!res.success) {
        toast.error(res.error || "Couldn't update this job");
        return;
      }
      toast.success("Services updated");
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 min-w-0";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Edit services</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Only possible before the technician begins work.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <input
              value={row.packageName}
              onChange={(e) => update(row.key, { packageName: e.target.value })}
              placeholder="Service name"
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              min={0}
              value={row.unitPrice}
              onChange={(e) => update(row.key, { unitPrice: Number(e.target.value) })}
              placeholder="₹"
              className={`${inputClass} w-20 shrink-0`}
            />
            <input
              type="number"
              min={1}
              value={row.quantity}
              onChange={(e) => update(row.key, { quantity: Number(e.target.value) })}
              className={`${inputClass} w-14 shrink-0`}
            />
            <button
              type="button"
              onClick={() => remove(row.key)}
              aria-label={`Remove ${row.packageName || "line"}`}
              className="shrink-0 w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="self-start flex items-center gap-1.5 text-xs font-bold text-[#00B4FF] hover:underline cursor-pointer"
      >
        <ClientIcon icon="ph:plus-bold" className="w-3.5 h-3.5" /> Add a service
      </button>

      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(0)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>GST</span>
          <span>₹{tax.toFixed(0)}</span>
        </div>
        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
          <span>New total</span>
          <span>₹{total.toFixed(0)}</span>
        </div>

        {difference !== 0 && (
          <div
            className={`flex items-center justify-between text-xs font-bold mt-1 ${
              difference > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <span>{difference > 0 ? "Balance to collect" : "To refund"}</span>
            <span>₹{Math.abs(difference).toFixed(0)}</span>
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-0.5">Customer paid ₹{paidTotal.toFixed(0)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="flex-1 h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save services"}
        </button>
      </div>
    </div>
  );
}
