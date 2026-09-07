"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { WizardModal } from "@/components/admin/services/WizardModal";
import { ImageUploadField } from "@/components/admin/services/ImageUploadField";
import { createCategory, updateCategory } from "@/actions/category.actions";
import { categorySchema, CategoryInput } from "@/lib/validations/category.schema";
import { emptyCategoryInput, slugify } from "./utils";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400";

function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CategoryInput;
  categoryId?: string;
};

export function CategoryFormModal({ isOpen, onClose, onSuccess, initialData, categoryId }: Props) {
  const isEdit = Boolean(categoryId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Seeded from isEdit so editing a live category never silently rewrites its
  // public URL just because the admin corrected a typo in the name.
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [form, setForm] = useState<CategoryInput>(initialData ?? emptyCategoryInput());

  const set = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetAndClose = () => {
    setErrors({});
    setForm(emptyCategoryInput());
    setSlugTouched(false);
    onClose();
  };

  const handleSubmit = async () => {
    const validated = categorySchema.safeParse(form);
    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])));
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = isEdit && categoryId ? await updateCategory(categoryId, validated.data) : await createCategory(validated.data);

      if (!res.success) {
        toast.error(res.error);
        if (res.errors) {
          setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        }
        return;
      }

      toast.success(isEdit ? "Category updated" : "Category created");
      onSuccess();
      resetAndClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardModal
      isOpen={isOpen}
      title={isEdit ? "Edit Category" : "Create Category"}
      stepLabels={["Details"]}
      currentStep={0}
      isLastStep
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save Changes" : "Create Category"}
      onClose={resetAndClose}
      onBack={() => {}}
      onNext={() => {}}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <Field label="Name" error={errors.name}>
          <input
            type="text"
            className={inputClass}
            value={form.name}
            placeholder="AC & Appliance"
            onChange={(e) => {
              set("name", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
          />
        </Field>

        <Field label="Slug" error={errors.slug} hint="Used in URLs, e.g. /services?category=ac-appliance">
          <input
            type="text"
            className={inputClass}
            value={form.slug}
            placeholder="ac-appliance"
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
          />
        </Field>

        <Field label="Description" error={errors.description} hint="Optional. Shown in the category modal on the homepage.">
          <textarea
            className={`${inputClass} min-h-20 resize-y`}
            value={form.description ?? ""}
            placeholder="AC servicing, repairs and appliance care."
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <Field label="Icon" error={errors.icon} hint="An Iconify name — browse at icon-sets.iconify.design">
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              className={inputClass}
              value={form.icon ?? ""}
              placeholder="ph:fan"
              onChange={(e) => set("icon", e.target.value)}
            />
            {/* Live preview — a typo'd icon name otherwise fails silently and
                ships an invisible tile to the homepage. */}
            <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              {form.icon ? <ClientIcon icon={form.icon} className="w-5 h-5" /> : <span className="text-[10px] font-bold text-slate-400">none</span>}
            </div>
          </div>
        </Field>

        <ImageUploadField label="Tile Image" value={form.image ?? ""} onChange={(url) => set("image", url)} error={errors.image} />

        <Field label="Sort Order" error={errors.sortOrder} hint="Lower numbers appear first. Ties are broken alphabetically.">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
          />
        </Field>

        <label className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active</span>
            <span className="text-xs text-slate-400">Inactive categories are hidden from the site but keep their services.</span>
          </span>
        </label>

        <label className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => set("isPopular", e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Is Popular</span>
            <span className="text-xs text-slate-400">Popular categories appear in the "Popular Services" section on the homepage.</span>
          </span>
        </label>
      </div>
    </WizardModal>
  );
}
