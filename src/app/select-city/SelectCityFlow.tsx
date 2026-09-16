"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { SERVICEABLE_CITIES } from "@/lib/cities";
import { setTechnicianCityAction } from "@/actions/kyc.actions";

/** Full-viewport, no dashboard chrome — this gates entry to /technician, so it can't reuse TechnicianLayoutWrapper. */
export function SelectCityFlow({ defaultCity }: { defaultCity: string | null }) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!city) {
      toast.error("Select a city to continue");
      return;
    }
    setSaving(true);
    const result = await setTechnicianCityAction(city);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.replace("/technician");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020813] flex flex-col items-center justify-center px-6 py-10 gap-6">
      <Image src="/logo-org.svg" alt="Handyzo" width={140} height={48} className="h-10 w-auto object-contain dark:brightness-0 dark:invert" />

      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Which city are you in?</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Used for your Handyzo technician ID. Takes a second.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <div className="relative">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40"
          >
            <option value="" disabled>
              Select a city
            </option>
            {SERVICEABLE_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ClientIcon
            icon="ph:caret-down-bold"
            className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={saving || !city}
          className="h-12 rounded-xl bg-[#00B4FF] text-white text-sm font-bold disabled:opacity-50 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
