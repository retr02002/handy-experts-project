"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { AddressFormSheet } from "@/components/shared/AddressFormSheet";
import {
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressSummary,
} from "@/actions/address.actions";

function addressIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("home")) return "ph:house-fill";
  if (lower.includes("work") || lower.includes("office")) return "ph:briefcase-fill";
  return "ph:map-pin-fill";
}

export function AddressesClient({ initialAddresses }: { initialAddresses: AddressSummary[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [sheetMode, setSheetMode] = useState<"none" | "create" | "edit">("none");
  const [editing, setEditing] = useState<AddressSummary | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const closeSheet = () => {
    setSheetMode("none");
    setEditing(null);
  };

  const handleSaved = (addr: AddressSummary) => {
    setAddresses((prev) => {
      const withoutOld = prev.filter((a) => a.id !== addr.id);
      const cleared = addr.isDefault ? withoutOld.map((a) => ({ ...a, isDefault: false })) : withoutOld;
      return [addr, ...cleared].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    });
    closeSheet();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    setBusyId(id);
    try {
      const res = await deleteAddressAction(id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete this address");
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted");
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setBusyId(id);
    try {
      const res = await setDefaultAddressAction(id);
      if (!res.success) {
        toast.error(res.error || "Failed to set default address");
        return;
      }
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Addresses</h1>
        <button
          onClick={() => setSheetMode("create")}
          className="shrink-0 flex items-center gap-1.5 bg-[#00B4FF] hover:bg-[#0096fa] text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
          <span className="hidden sm:inline">Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center">
            <ClientIcon icon="ph:map-pin" className="w-7 h-7" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">No saved addresses yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Save your home, office, or any other address to check out faster.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center shrink-0">
                <ClientIcon icon={addressIcon(addr.label)} className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{addr.label}</p>
                  {addr.isDefault && (
                    <span className="shrink-0 text-[9px] font-bold text-[#00B4FF] bg-[#00B4FF]/10 px-1.5 py-0.5 rounded-full">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                  {addr.addressLine}, {addr.city}, {addr.state} {addr.pincode}
                </p>
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={busyId === addr.id}
                      className="text-xs font-semibold text-[#00B4FF] hover:text-[#0096fa] disabled:opacity-50"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditing(addr);
                      setSheetMode("edit");
                    }}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={busyId === addr.id}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sheetMode !== "none" && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeSheet} />
          <div className="relative bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border-t sm:border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between w-full gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {sheetMode === "edit" ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={closeSheet}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors shrink-0"
                >
                  <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <AddressFormSheet
                mode={sheetMode === "edit" ? "edit" : "create"}
                initial={sheetMode === "edit" && editing ? editing : undefined}
                onCancel={closeSheet}
                onSaved={handleSaved}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
