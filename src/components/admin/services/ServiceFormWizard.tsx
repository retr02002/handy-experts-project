"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { WizardModal } from "./WizardModal";
import { ImageUploadField } from "./ImageUploadField";
import { VideoUploadField } from "./VideoUploadField";
import { createService, updateService } from "@/actions/service.actions";
import { serviceSchema, ServiceInput, ServiceBenefit, ServiceStep, ServiceFaq } from "@/lib/validations/service.schema";
import { emptyServiceInput, slugify } from "./utils";

type ServiceBenefitDraft = ServiceBenefit;
type ServiceStepDraft = ServiceStep;
type ServiceFaqDraft = ServiceFaq;

const STEP_LABELS = ["Basic Info", "Media & Description", "Benefits", "How It Works", "FAQs", "Review"];

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
  initialData?: ServiceInput;
  serviceId?: string;
};

export function ServiceFormWizard({ isOpen, onClose, onSuccess, initialData, serviceId }: Props) {
  const isEdit = Boolean(serviceId);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [form, setForm] = useState<ServiceInput>(initialData ?? emptyServiceInput());

  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetAndClose = () => {
    setStep(0);
    setErrors({});
    setForm(emptyServiceInput());
    setSlugTouched(false);
    onClose();
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (form.title.trim().length < 3) newErrors.title = "Title must be at least 3 characters";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) newErrors.slug = "Slug must be lowercase, alphanumeric, hyphen-separated";
      if (!form.category.trim()) newErrors.category = "Category is required";
    }

    if (step === 1) {
      if (!form.image.trim()) newErrors.image = "Image is required";
      if (form.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters";
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
    const validated = serviceSchema.safeParse(form);
    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])));
      setStep(0);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = isEdit && serviceId ? await updateService(serviceId, validated.data) : await createService(validated.data);

      if (!res.success) {
        toast.error(res.error);
        if (res.errors) {
          setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
          setStep(0);
        }
        return;
      }

      toast.success(isEdit ? "Service updated" : "Service created");
      onSuccess();
      resetAndClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBenefit = () => set("benefits", [...form.benefits, { icon: "", title: "", description: "" } as ServiceBenefitDraft]);
  const updateBenefit = (idx: number, key: keyof ServiceBenefitDraft, value: string) =>
    set("benefits", form.benefits.map((b, i) => (i === idx ? { ...b, [key]: value } : b)));
  const removeBenefit = (idx: number) => set("benefits", form.benefits.filter((_, i) => i !== idx));

  const addStep = () =>
    set("howItWorks", [...form.howItWorks, { step: form.howItWorks.length + 1, title: "", description: "" } as ServiceStepDraft]);
  const updateStep = (idx: number, key: "title" | "description", value: string) =>
    set("howItWorks", form.howItWorks.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  const removeStep = (idx: number) =>
    set(
      "howItWorks",
      form.howItWorks.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }))
    );

  const addFaq = () => set("faqs", [...form.faqs, { question: "", answer: "" } as ServiceFaqDraft]);
  const updateFaq = (idx: number, key: keyof ServiceFaqDraft, value: string) =>
    set("faqs", form.faqs.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  const removeFaq = (idx: number) => set("faqs", form.faqs.filter((_, i) => i !== idx));

  return (
    <WizardModal
      isOpen={isOpen}
      title={isEdit ? "Edit Service" : "Create Service"}
      stepLabels={STEP_LABELS}
      currentStep={step}
      isLastStep={step === STEP_LABELS.length - 1}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save Changes" : "Create Service"}
      onClose={resetAndClose}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
    >
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Field label="Service Title" error={errors.title}>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                set("title", title);
                if (!slugTouched) set("slug", slugify(title));
              }}
              placeholder="e.g. AC Deep Service & Repair"
            />
          </Field>
          <Field label="Slug" error={errors.slug} hint="Used in the service URL, e.g. /services/ac-deep-service">
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              placeholder="ac-deep-service"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" error={errors.category}>
              <input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="AC & Appliance" />
            </Field>
            <Field label="Rating">
              <input className={inputClass} value={form.rating} onChange={(e) => set("rating", e.target.value)} placeholder="4.9 (12,480 reviews)" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Badge Text">
              <input className={inputClass} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="TRENDING" />
            </Field>
            <Field label="Badge Color" hint="Tailwind classes">
              <input className={inputClass} value={form.badgeColor} onChange={(e) => set("badgeColor", e.target.value)} placeholder="bg-[#00B4FF] text-white" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Time Estimate">
              <input className={inputClass} value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="45 mins - 2 hrs" />
            </Field>
            <Field label="Warranty">
              <input className={inputClass} value={form.warranty} onChange={(e) => set("warranty", e.target.value)} placeholder="30-day AC warranty" />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <ImageUploadField label="Cover Image" value={form.image} onChange={(url) => set("image", url)} error={errors.image} />
          <VideoUploadField label="Demo Video" value={form.videoUrl ?? ""} onChange={(url) => set("videoUrl", url)} error={errors.videoUrl} />
          <Field label="Description" error={errors.description}>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what this service includes..."
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <RepeatableSection
          items={form.benefits}
          onAdd={addBenefit}
          addLabel="Add Benefit"
          emptyLabel="No benefits added yet. Benefits are optional."
          renderItem={(item, idx) => (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} value={item.icon} onChange={(e) => updateBenefit(idx, "icon", e.target.value)} placeholder="Icon (ph:leaf-duotone)" />
                <input className={inputClass} value={item.title} onChange={(e) => updateBenefit(idx, "title", e.target.value)} placeholder="Title" />
              </div>
              <textarea className={`${inputClass} min-h-[60px]`} value={item.description} onChange={(e) => updateBenefit(idx, "description", e.target.value)} placeholder="Description" />
            </div>
          )}
          onRemove={removeBenefit}
        />
      )}

      {step === 3 && (
        <RepeatableSection
          items={form.howItWorks}
          onAdd={addStep}
          addLabel="Add Step"
          emptyLabel="No steps added yet. How-it-works is optional."
          renderItem={(item, idx) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <input className={inputClass} value={item.title} onChange={(e) => updateStep(idx, "title", e.target.value)} placeholder="Step title" />
              </div>
              <textarea className={`${inputClass} min-h-[60px]`} value={item.description} onChange={(e) => updateStep(idx, "description", e.target.value)} placeholder="Step description" />
            </div>
          )}
          onRemove={removeStep}
        />
      )}

      {step === 4 && (
        <RepeatableSection
          items={form.faqs}
          onAdd={addFaq}
          addLabel="Add FAQ"
          emptyLabel="No FAQs added yet. FAQs are optional."
          renderItem={(item, idx) => (
            <div className="flex flex-col gap-2">
              <input className={inputClass} value={item.question} onChange={(e) => updateFaq(idx, "question", e.target.value)} placeholder="Question" />
              <textarea className={`${inputClass} min-h-[60px]`} value={item.answer} onChange={(e) => updateFaq(idx, "answer", e.target.value)} placeholder="Answer" />
            </div>
          )}
          onRemove={removeFaq}
        />
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4">
          {form.image && (
            <div
              className="w-full h-40 rounded-xl bg-cover bg-center border border-slate-200 dark:border-slate-700"
              style={{ backgroundImage: `url(${form.image})` }}
            />
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Title" value={form.title} />
            <SummaryItem label="Slug" value={form.slug} />
            <SummaryItem label="Category" value={form.category} />
            <SummaryItem label="Rating" value={form.rating || "—"} />
            <SummaryItem label="Time" value={form.time || "—"} />
            <SummaryItem label="Warranty" value={form.warranty || "—"} />
          </div>
          <SummaryItem label="Description" value={form.description} />
          <SummaryItem label="Demo Video" value={form.videoUrl ? "Attached" : "None"} />
          <SummaryItem label="Benefits" value={`${form.benefits.length} added`} />
          <SummaryItem label="How It Works" value={`${form.howItWorks.length} steps added`} />
          <SummaryItem label="FAQs" value={`${form.faqs.length} added`} />
        </div>
      )}
    </WizardModal>
  );
}

function RepeatableSection<T>({
  items,
  onAdd,
  addLabel,
  emptyLabel,
  renderItem,
  onRemove,
}: {
  items: T[];
  onAdd: () => void;
  addLabel: string;
  emptyLabel: string;
  renderItem: (item: T, idx: number) => React.ReactNode;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && <p className="text-sm text-slate-400 text-center py-6">{emptyLabel}</p>}
      {items.map((item, idx) => (
        <div key={idx} className="relative border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500 shadow-sm cursor-pointer"
          >
            <ClientIcon icon="ph:x-bold" className="w-3 h-3" />
          </button>
          <div className="pr-8">{renderItem(item, idx)}</div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer"
      >
        <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
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
