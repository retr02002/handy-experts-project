"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { createCouponAction, updateCouponAction, type AdminCoupon } from "@/actions/coupon.actions";

export interface CategoryWithCatalog {
  id: string;
  name: string;
  services: { id: string; title: string; packages: { id: string; name: string }[] }[];
}

interface ScopeSelection {
  categoryId?: string;
  serviceId?: string;
  packageId?: string;
}

function scopeKey(s: ScopeSelection): string {
  return s.categoryId ? `c:${s.categoryId}` : s.serviceId ? `s:${s.serviceId}` : `p:${s.packageId}`;
}

interface Props {
  categories: CategoryWithCatalog[];
  editing: AdminCoupon | null;
  onClose: () => void;
  onSaved: () => void;
}

// Three-part wizard in one scrollable modal (not separate steps) — the
// fields are few enough that paging between them would be more taps, not
// fewer, on a phone-width screen.
export function CouponFormModal({ categories, editing, onClose, onSaved }: Props) {
  const [code, setCode] = useState(editing?.code ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENTAGE">((editing?.discountType as "FLAT" | "PERCENTAGE") ?? "PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(editing ? String(editing.discountValue) : "");
  const [scopeType, setScopeType] = useState<"ALL" | "SPECIFIC">((editing?.scopeType as "ALL" | "SPECIFIC") ?? "ALL");
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(
    new Set(
      (editing?.scopes ?? []).map((s) =>
        scopeKey({ categoryId: s.categoryId ?? undefined, serviceId: s.serviceId ?? undefined, packageId: s.packageId ?? undefined })
      )
    )
  );
  const [hasSchedule, setHasSchedule] = useState(!!(editing?.startsAt || editing?.endsAt));
  const [startsAt, setStartsAt] = useState(editing?.startsAt ? editing.startsAt.slice(0, 16) : "");
  const [endsAt, setEndsAt] = useState(editing?.endsAt ? editing.endsAt.slice(0, 16) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const toggleScope = (key: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submit = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      const scopes: ScopeSelection[] = Array.from(selectedScopes).map((key) => {
        const [kind, id] = key.split(":");
        return kind === "c" ? { categoryId: id } : kind === "s" ? { serviceId: id } : { packageId: id };
      });

      const payload = {
        code,
        description: description || undefined,
        discountType,
        discountValue: Number(discountValue),
        scopeType,
        scopes,
        startsAt: hasSchedule && startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: hasSchedule && endsAt ? new Date(endsAt).toISOString() : null,
        isActive: editing?.isActive ?? true,
      };

      const res = editing ? await updateCouponAction(editing.id, payload) : await createCouponAction(payload);
      if (!res.success) {
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        toast.error(res.error || "Please fix the highlighted fields");
        return;
      }
      toast.success(editing ? "Coupon updated" : "Coupon created");
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  return (
    <Modal
      title={editing ? "Edit coupon" : "Create coupon"}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={isSaving || !code.trim() || !discountValue}
          className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold cursor-pointer transition-colors"
        >
          {isSaving ? "Saving..." : editing ? "Save Changes" : "Create Coupon"}
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Basics */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Basics</p>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              className={`${inputClass} uppercase`}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Shown to admins only" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-10">
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`flex-1 text-xs font-bold cursor-pointer ${discountType === "PERCENTAGE" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("FLAT")}
                className={`flex-1 text-xs font-bold cursor-pointer ${discountType === "FLAT" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                Flat ₹
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={discountType === "PERCENTAGE" ? 100 : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 200"}
              className={inputClass}
            />
          </div>
          {errors.discountValue && <p className="text-xs text-red-500 -mt-2">{errors.discountValue}</p>}
        </div>

        {/* Scope */}
        <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applies To</p>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-10">
            <button
              type="button"
              onClick={() => setScopeType("ALL")}
              className={`flex-1 text-xs font-bold cursor-pointer ${scopeType === "ALL" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
            >
              All Services
            </button>
            <button
              type="button"
              onClick={() => setScopeType("SPECIFIC")}
              className={`flex-1 text-xs font-bold cursor-pointer ${scopeType === "SPECIFIC" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
            >
              Specific
            </button>
          </div>

          {scopeType === "SPECIFIC" && (
            <div className="max-h-64 overflow-y-auto flex flex-col gap-3 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedScopes.has(scopeKey({ categoryId: cat.id }))}
                      onChange={() => toggleScope(scopeKey({ categoryId: cat.id }))}
                    />
                    {cat.name}
                  </label>
                  <div className="pl-5 flex flex-col gap-1">
                    {cat.services.map((svc) => (
                      <div key={svc.id} className="flex flex-col gap-1">
                        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedScopes.has(scopeKey({ serviceId: svc.id }))}
                            onChange={() => toggleScope(scopeKey({ serviceId: svc.id }))}
                          />
                          {svc.title}
                        </label>
                        <div className="pl-5 flex flex-col gap-1">
                          {svc.packages.map((pkg) => (
                            <label key={pkg.id} className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedScopes.has(scopeKey({ packageId: pkg.id }))}
                                onChange={() => toggleScope(scopeKey({ packageId: pkg.id }))}
                              />
                              {pkg.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.scopes && <p className="text-xs text-red-500">{errors.scopes}</p>}
        </div>

        {/* Schedule */}
        <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer">
            <input type="checkbox" checked={hasSchedule} onChange={(e) => setHasSchedule(e.target.checked)} />
            <ClientIcon icon="ph:calendar-bold" className="w-3.5 h-3.5" /> Schedule this coupon
          </label>
          {hasSchedule && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Starts</label>
                <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Ends</label>
                <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
              </div>
              {errors.endsAt && <p className="text-xs text-red-500 col-span-2">{errors.endsAt}</p>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
