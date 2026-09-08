"use client";

import React, { useEffect, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getMyAddressesAction, type AddressSummary } from "@/actions/address.actions";
import { AddressPickerModal } from "./AddressPickerModal";

// The navbar's "current location" trigger — thin wrapper around the same
// DB-backed address book everything else (checkout, /customer/addresses)
// uses via AddressPickerModal, so an address saved anywhere shows up
// everywhere. Used to have its own separate localStorage-only address list
// here; that's gone now, this is purely a display + entry point.
export function LocationPicker() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<AddressSummary | null>(null);

  useEffect(() => {
    setMounted(true);
    getMyAddressesAction().then((res) => {
      if (res.success && res.data && res.data.length > 0) setCurrent(res.data[0]);
    });
  }, []);

  const label = current ? current.label : "Select your location";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 md:gap-3 py-1 group text-left min-w-0 w-full max-w-[220px] sm:max-w-[280px] md:max-w-sm"
      >
        <div className="shrink-0">
          <ClientIcon icon="ph:map-pin-fill" className="w-6 h-6 md:w-7 md:h-7 text-[#00B4FF]" />
        </div>
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <div className="flex items-center gap-1">
            <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
              {current ? current.label : "Select Location"}
            </span>
            <ClientIcon icon="ph:caret-down-bold" className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
          </div>
          <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 truncate w-full leading-tight mt-0.5">
            {current 
              ? `${current.addressLine}, ${current.city}`
              : "Please select your location"}
          </span>
        </div>
      </button>

      {mounted && isOpen && (
        <AddressPickerModal
          onSelect={(addr) => {
            setCurrent(addr);
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
