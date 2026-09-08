"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getCheckoutPrefillAction, type AddressSummary } from "@/actions/address.actions";
import { AddressPickerModal } from "@/components/shared/AddressPickerModal";
import type { CustomerDetails } from "../checkoutTypes";

interface Props {
  details: CustomerDetails;
  // Accepts a plain value or a functional updater (like React's own setState)
  // so the two mount-time autofill effects below can't race each other by
  // both computing "next" off the same stale closure.
  onChange: (details: CustomerDetails | ((prev: CustomerDetails) => CustomerDetails)) => void;
}

export function DetailsStep({ details, onChange }: Props) {
  const { data: session } = useSession();
  const [pickerOpen, setPickerOpen] = useState(false);
  const autofilledRef = useRef(false);
  // Seeded from any pre-existing value so navigating back to this step
  // doesn't silently lose the toggle state (and the fields behind it).
  const [hasSiteContact, setHasSiteContact] = useState(details.siteContactPhone.trim() !== "");

  useEffect(() => {
    if (autofilledRef.current || !session?.user) return;
    autofilledRef.current = true;
    onChange((prev) => ({
      ...prev,
      name: prev.name || session.user!.name || "",
      email: prev.email || session.user!.email || "",
    }));
  }, [session, onChange]);

  // One-time server round trip for the phone number + default saved address
  // — both only ever fill an empty field, never clobber something the
  // customer already typed or picked this session.
  const prefillRef = useRef(false);
  useEffect(() => {
    if (prefillRef.current) return;
    prefillRef.current = true;
    getCheckoutPrefillAction().then((res) => {
      if (!res.success || !res.data) return;
      const { phone, addresses } = res.data;
      const defaultAddress = addresses[0];
      onChange((prev) => {
        const next = { ...prev };
        let changed = false;
        if (!next.phone && phone) {
          next.phone = phone;
          changed = true;
        }
        if (!next.address && defaultAddress) {
          next.address = defaultAddress.addressLine;
          next.city = defaultAddress.city;
          next.state = defaultAddress.state;
          next.pincode = defaultAddress.pincode;
          next.latitude = defaultAddress.latitude;
          next.longitude = defaultAddress.longitude;
          changed = true;
        }
        return changed ? next : prev;
      });
    });
  }, [onChange]);

  const setField = <K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) => {
    onChange({ ...details, [key]: value });
  };

  const applyAddress = (addr: AddressSummary) => {
    onChange({
      ...details,
      address: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
    setPickerOpen(false);
  };

  const hasAddress = details.address.trim() !== "";

  return (
    <div className="bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Details</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          We&apos;ll use this to confirm and schedule your service.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          icon="ph:user"
          value={details.name}
          onChange={(v) => setField("name", v)}
          placeholder="Your name"
        />
        <Field
          label="Phone Number"
          icon="ph:phone"
          value={details.phone}
          onChange={(v) => setField("phone", v.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile number"
          inputMode="numeric"
        />
      </div>

      <Field
        label="Email"
        icon="ph:envelope-simple"
        value={details.email}
        onChange={(v) => setField("email", v)}
        placeholder="you@example.com"
        type="email"
      />

      {/* Delivery address */}
      <div>
        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5 mb-1.5 block">
          Delivery Address
        </label>
        {hasAddress ? (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <ClientIcon icon="ph:map-pin-fill" className="w-4.5 h-4.5 text-[#00B4FF] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white break-words line-clamp-2">{details.address}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {details.city}, {details.state} {details.pincode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-xs font-bold text-[#00B4FF] hover:text-blue-600 shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-3 w-full p-3.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00B4FF] dark:hover:border-[#00B4FF] transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:map-pin-plus-fill" className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-0">
              Select delivery address
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none pt-4">
          <input
            type="checkbox"
            checked={hasSiteContact}
            onChange={(e) => {
              const checked = e.target.checked;
              setHasSiteContact(checked);
              if (!checked) onChange({ ...details, siteContactName: "", siteContactPhone: "" });
            }}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40 shrink-0"
          />
          <span className="min-w-0">Booking for someone else? Add a different receiver number</span>
        </label>
        {hasSiteContact && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Receiver Name (optional)"
              icon="ph:user-focus"
              value={details.siteContactName}
              onChange={(v) => setField("siteContactName", v)}
              placeholder="e.g. Ramesh"
            />
            <Field
              label="Receiver Number"
              icon="ph:phone-call"
              value={details.siteContactPhone}
              onChange={(v) => setField("siteContactPhone", v.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit number to call at the site"
              inputMode="numeric"
            />
          </div>
        )}
      </div>

      {pickerOpen && <AddressPickerModal onSelect={applyAddress} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="min-w-0">
      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5 mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <ClientIcon icon={icon} className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 sm:h-auto bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
      </div>
    </div>
  );
}
