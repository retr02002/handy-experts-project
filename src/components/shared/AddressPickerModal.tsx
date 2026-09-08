"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { reverseGeocodeAction } from "@/actions/location.actions";
import { getMyAddressesAction, type AddressSummary } from "@/actions/address.actions";
import { AddressFormSheet } from "./AddressFormSheet";

function addressIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("home")) return "ph:house-fill";
  if (lower.includes("work") || lower.includes("office")) return "ph:briefcase-fill";
  return "ph:map-pin-fill";
}

interface Props {
  onSelect: (address: AddressSummary) => void;
  onClose: () => void;
}

export function AddressPickerModal({ onSelect, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<AddressSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setMounted(true);
    getMyAddressesAction().then((res) => {
      if (res.success && res.data) setAddresses(res.data);
      setLoaded(true);
    });
  }, []);

  const detectAndUse = () => {
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
            toast.error("Couldn't fetch your location.");
            return;
          }
          onSelect({
            id: "",
            label: "Current Location",
            addressLine: result.data.displayName,
            city: result.data.rawCity,
            state: result.data.rawState,
            pincode: result.data.pincode.replace(/^,\s*/, ""),
            latitude,
            longitude,
            isDefault: false,
          });
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Location access denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 border-t sm:border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between w-full gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate min-w-0">
              {showForm ? "Add New Address" : "Select Delivery Address"}
            </h2>
            <button
              onClick={() => (showForm ? setShowForm(false) : onClose())}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0"
            >
              <ClientIcon icon={showForm ? "ph:arrow-left-bold" : "ph:x-bold"} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          {showForm ? (
            <AddressFormSheet
              mode="create"
              onCancel={() => setShowForm(false)}
              onSaved={(addr) => {
                setShowForm(false);
                onSelect(addr);
              }}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={detectAndUse}
                disabled={locating}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-[#00B4FF]/30 hover:bg-[#00B4FF]/5 transition-all text-left disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-full bg-[#00B4FF]/10 flex items-center justify-center shrink-0">
                  <ClientIcon icon={locating ? "svg-spinners:180-ring" : "ph:crosshair-simple-bold"} className="w-4 h-4 text-[#00B4FF]" />
                </div>
                <span className="text-sm font-semibold text-[#00B4FF] min-w-0">
                  {locating ? "Detecting..." : "Use current location"}
                </span>
              </button>

              {!loaded ? (
                <div className="py-6 text-center text-slate-400 text-sm">Loading addresses...</div>
              ) : addresses.length > 0 ? (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Saved Addresses</h3>
                  <div className="flex flex-col gap-1.5">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => onSelect(addr)}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <ClientIcon icon={addressIcon(addr.label)} className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{addr.label}</p>
                            {addr.isDefault && (
                              <span className="shrink-0 text-[9px] font-bold text-[#00B4FF] bg-[#00B4FF]/10 px-1.5 py-0.5 rounded-full">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{addr.addressLine}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <ClientIcon icon="ph:plus-bold" className="w-4 h-4 shrink-0" />
                <span className="truncate">Add New Address</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
