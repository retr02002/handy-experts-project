"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { reverseGeocodeAction } from "@/actions/location.actions";
import type { CustomerDetails } from "../checkoutTypes";

interface Props {
  details: CustomerDetails;
  onChange: (details: CustomerDetails) => void;
}

export function DetailsStep({ details, onChange }: Props) {
  const { data: session } = useSession();
  const [locating, setLocating] = useState(false);
  const autofilledRef = useRef(false);

  useEffect(() => {
    if (autofilledRef.current || !session?.user) return;
    autofilledRef.current = true;
    onChange({
      ...details,
      name: details.name || session.user.name || "",
      email: details.email || session.user.email || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const setField = <K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) => {
    onChange({ ...details, [key]: value });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const result = await reverseGeocodeAction(latitude, longitude);
          if (!result.success || !result.data) {
            toast.error("Couldn't fetch your location. Please enter address manually.");
            return;
          }
          const { displayName, pincode, rawCity, rawState } = result.data;
          onChange({
            ...details,
            address: displayName || details.address,
            city: rawCity || details.city,
            state: rawState || details.state,
            pincode: pincode.replace(/^,\s*/, "") || details.pincode,
          });
          if (!pincode) toast.error("Couldn't detect a pincode — please enter it manually.");
          else toast.success("Location detected");
        } catch {
          toast.error("Couldn't fetch your location. Please enter address manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Location access denied.");
        setLocating(false);
      }
    );
  };

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

      <div>
        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5 mb-1.5 block">Address</label>
        <div className="relative">
          <div className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
            <ClientIcon icon="ph:map-pin" className="w-4 h-4" />
          </div>
          <textarea
            value={details.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="House / Flat No, Street, Area"
            rows={3}
            className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="City"
          icon="ph:buildings"
          value={details.city}
          onChange={(v) => setField("city", v)}
          placeholder="Your city"
        />
        <Field
          label="State"
          icon="ph:map-trifold"
          value={details.state}
          onChange={(v) => setField("state", v)}
          placeholder="Your state"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Field
          label="Pincode"
          icon="ph:hash"
          value={details.pincode}
          onChange={(v) => setField("pincode", v.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit pincode"
          inputMode="numeric"
        />
        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className="h-12 sm:h-[46px] flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          <ClientIcon icon={locating ? "svg-spinners:180-ring" : "ph:crosshair-simple-bold"} className="w-4 h-4" />
          {locating ? "Detecting..." : "Use current location"}
        </button>
      </div>
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
    <div>
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
