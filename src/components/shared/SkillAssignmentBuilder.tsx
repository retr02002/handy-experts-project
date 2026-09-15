"use client";

import React, { useEffect, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import {
  getCategoriesWithServiceOptionsAction,
  type CategoryWithServiceOptions,
} from "@/actions/category.actions";
import type { SkillAssignmentInput } from "@/lib/validations/technician.schema";

/**
 * The modular "what they do" builder: pick a category, optionally narrow to
 * specific services within it (leave blank = the whole category), click Add,
 * repeat for another category. Each added row shows as a removable chip.
 *
 * Used identically by vendor technician creation/editing and self-onboarding
 * — one component, one interaction, not reinvented per form.
 */
export function SkillAssignmentBuilder({
  value,
  onChange,
  error,
}: {
  value: SkillAssignmentInput[];
  onChange: (next: SkillAssignmentInput[]) => void;
  error?: string;
}) {
  const [categories, setCategories] = useState<CategoryWithServiceOptions[] | null>(null);
  const [draftCategoryId, setDraftCategoryId] = useState("");
  const [draftServiceIds, setDraftServiceIds] = useState<string[]>([]);

  useEffect(() => {
    getCategoriesWithServiceOptionsAction().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  const draftCategory = categories?.find((c) => c.id === draftCategoryId) ?? null;
  const alreadyAdded = new Set(value.map((v) => v.categoryId));

  const addRow = () => {
    if (!draftCategoryId) return;
    const next = [...value.filter((v) => v.categoryId !== draftCategoryId), { categoryId: draftCategoryId, serviceIds: draftServiceIds }];
    onChange(next);
    setDraftCategoryId("");
    setDraftServiceIds([]);
  };

  const removeRow = (categoryId: string) => onChange(value.filter((v) => v.categoryId !== categoryId));

  const toggleDraftService = (serviceId: string) =>
    setDraftServiceIds((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));

  const nameFor = (categoryId: string) => categories?.find((c) => c.id === categoryId)?.name ?? categoryId;
  const titleFor = (categoryId: string, serviceId: string) =>
    categories?.find((c) => c.id === categoryId)?.services.find((s) => s.id === serviceId)?.title ?? serviceId;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block">What they do</label>

      {value.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {value.map((row) => (
            <div
              key={row.categoryId}
              className="flex items-start justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{nameFor(row.categoryId)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {row.serviceIds.length === 0
                    ? "All services in this category"
                    : row.serviceIds.map((id) => titleFor(row.categoryId, id)).join(", ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.categoryId)}
                aria-label={`Remove ${nameFor(row.categoryId)}`}
                className="shrink-0 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <ClientIcon icon="ph:x-bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col gap-2.5">
        <select
          value={draftCategoryId}
          onChange={(e) => {
            setDraftCategoryId(e.target.value);
            setDraftServiceIds([]);
          }}
          className="w-full h-10 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        >
          <option value="">{categories === null ? "Loading categories..." : "Choose a category to add"}</option>
          {categories
            ?.filter((c) => !alreadyAdded.has(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>

        {draftCategory && draftCategory.services.length > 0 && (
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              Optional — narrow to specific services, or leave blank for the whole category:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {draftCategory.services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleDraftService(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    draftServiceIds.includes(s.id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={addRow}
          disabled={!draftCategoryId}
          className="self-start flex items-center gap-1.5 text-xs font-bold text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:underline cursor-pointer"
        >
          <ClientIcon icon="ph:plus-bold" className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
