"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { WizardModal } from "./WizardModal";
import { ImageUploadField } from "./ImageUploadField";
import { createPackage, updatePackage } from "@/actions/package.actions";
import { servicePackageSchema, ServicePackageInput } from "@/lib/validations/service.schema";
import { emptyPackageInput } from "./utils";

const STEP_LABELS = ["Service", "Basic Info", "Pricing", "Media", "Features & Details", "Review"];

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
  services: { id: string; title: string }[];
  initialServiceId?: string;
  initialData?: ServicePackageInput;
  packageId?: string;
};

export function PackageFormWizard({ isOpen, onClose, onSuccess, services, initialServiceId, initialData, packageId }: Props) {
  const isEdit = Boolean(packageId);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ServicePackageInput>(initialData ?? emptyPackageInput(initialServiceId));
  const [featureDraft, setFeatureDraft] = useState("");
  const [detailDraft, setDetailDraft] = useState("");

  const set = <K extends keyof ServicePackageInput>(key: K, value: ServicePackageInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetAndClose = () => {
    setStep(0);
    setErrors({});
    setForm(emptyPackageInput(initialServiceId));
    setFeatureDraft("");
    setDetailDraft("");
    onClose();
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!form.serviceId) newErrors.serviceId = "Select which service this package belongs to";
    }

    if (step === 1) {
      if (form.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";
    }

    if (step === 2) {
      if (form.price < 0) newErrors.price = "Price must be 0 or more";
      if (form.originalPrice < 0) newErrors.originalPrice = "Original price must be 0 or more";
    }

    if (step === 4) {
      if (form.features.length === 0) newErrors.features = "Add at least one feature";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    const validated = servicePackageSchema.safeParse(form);
    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])));
      setStep(0);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = isEdit && packageId ? await updatePackage(packageId, validated.data) : await createPackage(validated.data);

      if (!res.success) {
        toast.error(res.error);
        if (res.errors) {
          setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
          setStep(0);
        }
        return;
      }

      toast.success(isEdit ? "Package updated" : "Package created");
      onSuccess();
      resetAndClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    if (!featureDraft.trim()) return;
    set("features", [...form.features, featureDraft.trim()]);
    setFeatureDraft("");
  };
  const removeFeature = (idx: number) => set("features", form.features.filter((_, i) => i !== idx));

  const addDetail = () => {
    if (!detailDraft.trim()) return;
    set("details", [...form.details, detailDraft.trim()]);
    setDetailDraft("");
  };
  const removeDetail = (idx: number) => set("details", form.details.filter((_, i) => i !== idx));

  const discountPct =
    form.originalPrice > form.price && form.originalPrice > 0
      ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)
      : 0;

  return (
    <WizardModal
      isOpen={isOpen}
      title={isEdit ? "Edit Package" : "Create Package"}
      stepLabels={STEP_LABELS}
      currentStep={step}
      isLastStep={step === STEP_LABELS.length - 1}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save Changes" : "Create Package"}
      onClose={resetAndClose}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
    >
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Field label="Service" error={errors.serviceId} hint="Which service is this package offered under?">
            <select
              className={inputClass}
              value={form.serviceId}
              onChange={(e) => set("serviceId", e.target.value)}
            >
              <option value="">Select a service...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </Field>
          {services.length === 0 && (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              No services exist yet — create a service first before adding packages.
            </p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Field label="Package Name" error={errors.name}>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Split AC Deep Foam Clean" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Bestsellers" />
            </Field>
            <Field label="Tag">
              <input className={inputClass} value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="Bestseller" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rating">
              <input className={inputClass} value={form.rating} onChange={(e) => set("rating", e.target.value)} placeholder="4.9 (4,210)" />
            </Field>
            <Field label="Duration">
              <input className={inputClass} value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="45 mins" />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹)" error={errors.price}>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </Field>
            <Field label="Original Price (₹)" error={errors.originalPrice}>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", Number(e.target.value))}
              />
            </Field>
          </div>
          {discountPct > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-sm font-bold text-emerald-700 dark:text-emerald-400 w-fit">
              <ClientIcon icon="ph:tag-bold" className="w-4 h-4" />
              {discountPct}% off · Customers save ₹{form.originalPrice - form.price}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <ImageUploadField
          label="Package Image (optional — falls back to the service's cover image)"
          value={form.image ?? ""}
          onChange={(url) => set("image", url)}
        />
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Features <span className="text-slate-400 font-normal">(shown as bullet highlights)</span>
            </label>
            {errors.features && <span className="text-xs font-medium text-red-500">{errors.features}</span>}
            <div className="flex flex-col gap-2">
              {form.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  <button type="button" onClick={() => removeFeature(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                    <ClientIcon icon="ph:x-bold" className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={featureDraft}
                onChange={(e) => setFeatureDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="e.g. High-pressure foam jet wash"
              />
              <button type="button" onClick={addFeature} className="px-4 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-sm font-bold cursor-pointer shrink-0">
                Add
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Details <span className="text-slate-400 font-normal">(optional — full step-by-step breakdown shown in the package modal)</span>
            </label>
            <div className="flex flex-col gap-2">
              {form.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{detail}</span>
                  <button type="button" onClick={() => removeDetail(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                    <ClientIcon icon="ph:x-bold" className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={detailDraft}
                onChange={(e) => setDetailDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDetail();
                  }
                }}
                placeholder="e.g. Pre-service inspection of cooling efficiency..."
              />
              <button type="button" onClick={addDetail} className="px-4 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-sm font-bold cursor-pointer shrink-0">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4">
          {form.image && (
            <div className="w-full h-40 rounded-xl bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: `url(${form.image})` }} />
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Service" value={services.find((s) => s.id === form.serviceId)?.title || "—"} />
            <SummaryItem label="Name" value={form.name} />
            <SummaryItem label="Category" value={form.category || "—"} />
            <SummaryItem label="Price" value={`₹${form.price}`} />
            <SummaryItem label="Original Price" value={`₹${form.originalPrice}`} />
            <SummaryItem label="Duration" value={form.time || "—"} />
            <SummaryItem label="Tag" value={form.tag || "—"} />
          </div>
          <SummaryItem label="Features" value={`${form.features.length} added`} />
          <SummaryItem label="Details" value={`${form.details.length} added`} />
        </div>
      )}
    </WizardModal>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">{value}</span>
    </div>
  );
}
