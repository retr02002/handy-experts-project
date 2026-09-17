"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Input } from "@/components/ui/Input";
import { submitContactQueryAction, type ContactQueryReasonValue } from "@/actions/contactquery.actions";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  reason: "" as ContactQueryReasonValue | "",
  message: "",
};

export function ContactPageForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await submitContactQueryAction(form);
      if (!res.success) {
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        toast.error(res.error || "Please fix the highlighted fields");
        return;
      }
      toast.success("Message sent — we'll get back to you within 24 hours.");
      setForm(EMPTY_FORM);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B1221]/90 backdrop-blur-xl rounded-[32px] sm:rounded-[40px] border border-slate-100 dark:border-slate-800/80 p-5 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)]">

      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-[#00B4FF] mb-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <ClientIcon icon="ph:paper-plane-right-duotone" className="w-6 h-6" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">Send us a message</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Prefer to write? Drop your details below and our team will get back to you within 24 hours.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Input
              inputType="input"
              type="text"
              placeholder="First Name"
              icon="ph:user-duotone"
              className="!rounded-2xl !py-4"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <Input
              inputType="input"
              type="text"
              placeholder="Last Name"
              icon="ph:user-duotone"
              className="!rounded-2xl !py-4"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <Input
            inputType="input"
            type="email"
            placeholder="Email Address"
            icon="ph:envelope-simple-duotone"
            className="!rounded-2xl !py-4"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Input
            inputType="select"
            placeholder="How can we help you?"
            icon="ph:question-duotone"
            className="!rounded-2xl !py-4"
            value={form.reason}
            onChange={(e) => set("reason", e.target.value as ContactQueryReasonValue)}
            options={[
              { value: "GENERAL", label: "General Inquiry" },
              { value: "SUPPORT", label: "Customer Support" },
              { value: "SALES", label: "Sales & Pricing" },
              { value: "PARTNER", label: "Become a Partner" },
            ]}
          />
          {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
        </div>

        <div>
          <Input
            inputType="textarea"
            placeholder="Write your message here..."
            rows={5}
            className="!rounded-[24px] resize-none !pl-5 !py-4"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
          />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 dark:bg-[#00B4FF] hover:bg-slate-800 dark:hover:bg-[#009EE0] disabled:opacity-60 text-white font-black text-lg py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/10 dark:shadow-[#00B4FF]/20 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-[#00B4FF]/30 hover:-translate-y-1 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
            {!isSubmitting && <ClientIcon icon="ph:arrow-right-bold" className="w-5 h-5" />}
          </button>

          <div className="text-center mt-6">
            <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
              Your information is secure. Read our <a href="#" className="text-slate-900 dark:text-white hover:underline transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
