"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { completeVendorOnboarding } from "@/actions/onboarding.actions";
import { reverseGeocodeAction } from "@/actions/location.actions";
import { COMPANY_TYPES } from "@/lib/validations/onboarding.schema";
import { OnboardingField } from "./OnboardingField";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface Props {
  initialName?: string;
  onBack?: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  companyName: "",
  companyType: "",
  gstNumber: "",
  panNumber: "",
  aadhaarNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: null as number | null,
  longitude: null as number | null,
  incorporationDate: "",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 mt-1">
      {children}
    </h3>
  );
}

export function VendorDetailsStep({ initialName = "", onBack, onSuccess }: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM, name: initialName });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported on this device.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await reverseGeocodeAction(pos.coords.latitude, pos.coords.longitude);
          if (!res.success || !res.data) {
            toast.error("Couldn't detect your location. Please enter it manually.");
            return;
          }
          const data = res.data;
          setForm((prev) => ({
            ...prev,
            address: data.displayName || prev.address,
            city: data.rawCity || prev.city,
            state: data.rawState || prev.state,
            pincode: data.pincode.replace(/^,\s*/, "") || prev.pincode,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
          toast.success("Location detected");
        } catch {
          toast.error("Couldn't detect your location. Please enter it manually.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error("Location access denied.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await completeVendorOnboarding({
        ...form,
        companyType: form.companyType as (typeof COMPANY_TYPES)[number],
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      });
      if (!res.success) {
        if (res.errors) {
          setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        }
        toast.error(res.error || "Please fix the highlighted fields");
        return;
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-9 pt-5 sm:pt-8 lg:pt-9 pb-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-4 -ml-1 transition-colors cursor-pointer"
          >
            <ClientIcon icon="ph:arrow-left-bold" className="w-3.5 h-3.5" /> Back
          </button>
        )}

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md mb-3">
            <ClientIcon icon="ph:buildings-fill" className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Register your company</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            We verify every vendor before you can start accepting jobs.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <SectionLabel>Contact Person</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OnboardingField
                label="Full Name"
                icon="ph:user"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name"
                error={errors.name}
                required
              />
              <OnboardingField
                label="Phone Number"
                icon="ph:phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                error={errors.phone}
                required
              />
            </div>
          </div>

          <div>
            <SectionLabel>Company Details</SectionLabel>
            <div className="flex flex-col gap-4">
              <OnboardingField
                label="Company Name"
                icon="ph:buildings"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="Your registered company name"
                error={errors.companyName}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OnboardingField
                  as="select"
                  label="Type of Company"
                  icon="ph:briefcase"
                  value={form.companyType}
                  onChange={(e) => set("companyType", e.target.value)}
                  options={COMPANY_TYPES}
                  error={errors.companyType}
                />
                <OnboardingField
                  label="Incorporation Date"
                  icon="ph:calendar"
                  type="date"
                  value={form.incorporationDate}
                  onChange={(e) => set("incorporationDate", e.target.value)}
                  error={errors.incorporationDate}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OnboardingField
                  label="GST Number"
                  icon="ph:identification-card"
                  value={form.gstNumber}
                  onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  error={errors.gstNumber}
                  required
                />
                <OnboardingField
                  label="PAN Card Number"
                  icon="ph:card-holder"
                  value={form.panNumber}
                  onChange={(e) => set("panNumber", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  error={errors.panNumber}
                  required
                />
              </div>
              <OnboardingField
                label="Aadhaar Number"
                icon="ph:identification-badge"
                inputMode="numeric"
                value={form.aadhaarNumber}
                onChange={(e) => set("aadhaarNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12-digit Aadhaar number of the contact person"
                error={errors.aadhaarNumber}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5 mt-1">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Registered Address
              </h3>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-xs font-bold text-[#00B4FF] hover:text-blue-600 disabled:opacity-60 transition-colors cursor-pointer"
              >
                <ClientIcon
                  icon={isLocating ? "svg-spinners:180-ring" : "ph:crosshair-simple-bold"}
                  className="w-3.5 h-3.5"
                />
                {isLocating ? "Detecting..." : "Use current location"}
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <OnboardingField
                as="textarea"
                label="Street Address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Building, street, area"
                error={errors.address}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OnboardingField
                  label="City"
                  icon="ph:map-pin"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="City"
                  error={errors.city}
                  required
                />
                <OnboardingField
                  label="State"
                  icon="ph:map-trifold"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="State"
                  error={errors.state}
                  required
                />
              </div>
              <OnboardingField
                label="Pincode"
                icon="ph:hash"
                inputMode="numeric"
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit pincode"
                error={errors.pincode}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-5 sm:px-8 lg:px-9 py-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-4 bg-white dark:bg-[#0A101D]">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white rounded-xl py-3.5 sm:py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          {isSubmitting ? "Saving..." : "Complete Registration"}
        </button>
      </div>
    </form>
  );
}
