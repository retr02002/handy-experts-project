"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { setCouponActiveAction, deleteCouponAction, type AdminCoupon } from "@/actions/coupon.actions";
import { CouponFormModal, type CategoryWithCatalog } from "./CouponFormModal";

interface Props {
  initialCoupons: AdminCoupon[];
  categories: CategoryWithCatalog[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function discountLabel(c: AdminCoupon): string {
  return c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `₹${c.discountValue} off`;
}

function scopeLabel(c: AdminCoupon): string {
  if (c.scopeType === "ALL") return "All services";
  const names = c.scopes.map((s) => s.packageName ?? s.serviceName ?? s.categoryName).filter(Boolean);
  if (names.length === 0) return "No scope set";
  return names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}

export function CouponsManager({ initialCoupons, categories }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (c: AdminCoupon) => {
    setEditing(c);
    setFormOpen(true);
  };

  // The modal always re-fetches nothing itself — simplest reliable refresh
  // after a create/update/delete is a full reload of this small list.
  const refresh = () => {
    window.location.reload();
  };

  const toggleActive = async (c: AdminCoupon) => {
    setBusyId(c.id);
    try {
      const res = await setCouponActiveAction(c.id, !c.isActive);
      if (!res.success) {
        toast.error(res.error || "Couldn't update this coupon");
        return;
      }
      setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await deleteCouponAction(id);
      if (!res.success) {
        toast.error(res.error || "Couldn't delete this coupon");
        return;
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Coupons</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discount codes customers can apply at checkout — scoped to specific services or store-wide, with an optional schedule.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-colors"
        >
          <ClientIcon icon="ph:plus-bold" className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <ClientIcon icon="ph:ticket" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No coupons yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {coupons.map((c) => (
            <div key={c.id} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <ClientIcon icon="ph:ticket-fill" className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">{c.code}</p>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">{discountLabel(c)}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{scopeLabel(c)}</p>
                {(c.startsAt || c.endsAt) && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {c.startsAt ? formatDate(c.startsAt) : "Now"} &rarr; {c.endsAt ? formatDate(c.endsAt) : "No end"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleActive(c)}
                disabled={busyId === c.id}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 disabled:opacity-50 cursor-pointer ${
                  c.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {c.isActive ? "Active" : "Disabled"}
              </button>
              <button
                type="button"
                onClick={() => openEdit(c)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                aria-label={`Edit ${c.code}`}
              >
                <ClientIcon icon="ph:pencil-simple-bold" className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(c.id)}
                disabled={busyId === c.id}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer transition-colors"
                aria-label={`Delete ${c.code}`}
              >
                <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <CouponFormModal
          categories={categories}
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
