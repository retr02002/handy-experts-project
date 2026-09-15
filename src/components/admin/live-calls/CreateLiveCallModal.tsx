"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { generatePin, generatePinPair } from "@/lib/pins";
import { useDebounce } from "@/hooks/useDebounce";
import { AdminLocationPicker, type AdminLocationValue } from "./AdminLocationPicker";
import {
  adminCreateLiveCallAction,
  getPackagesForAdminOrderAction,
  getVendorsForAssignmentAction,
  searchExistingCustomersAction,
  type AdminOrderPackageOption,
  type AdminOrderVendorOption,
  type CustomerSearchResult,
} from "@/actions/adminlivecall.actions";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface ItemRow {
  packageId: string;
  quantity: number;
}

const EMPTY_LOCATION: AdminLocationValue = { address: "", city: "", state: "", pincode: "" };

function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
      <ClientIcon icon={icon} className="w-3.5 h-3.5" /> {children}
    </p>
  );
}

function PinField({
  label,
  value,
  onChange,
  onRegenerate,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
          className="w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm font-mono font-bold tracking-[0.2em] text-center text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <button
          type="button"
          onClick={onRegenerate}
          title="Generate a new PIN"
          className="w-11 h-11 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-400 flex items-center justify-center cursor-pointer transition-colors"
        >
          <ClientIcon icon="ph:arrows-clockwise-bold" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CreateLiveCallModal({ onClose, onCreated }: Props) {
  const [packages, setPackages] = useState<AdminOrderPackageOption[]>([]);
  const [vendors, setVendors] = useState<AdminOrderVendorOption[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  // Set only when a search result is picked — a pure client-side
  // convenience badge. resolveCustomerId's phone-based find-or-create on
  // the server stays the real source of truth regardless of this.
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerResults, setCustomerResults] = useState<CustomerSearchResult[]>([]);
  const debouncedCustomerName = useDebounce(customerName, 300);
  const [location, setLocation] = useState<AdminLocationValue>(EMPTY_LOCATION);
  const [items, setItems] = useState<ItemRow[]>([{ packageId: "", quantity: 1 }]);
  const [isInstant, setIsInstant] = useState(true);
  const [scheduledFor, setScheduledFor] = useState("");
  const [assignMode, setAssignMode] = useState<"broadcast" | "assign">("broadcast");
  const [assignVendorId, setAssignVendorId] = useState("");
  const [pins, setPins] = useState(() => generatePinPair());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getPackagesForAdminOrderAction(), getVendorsForAssignmentAction()]).then(([pkgRes, vendorRes]) => {
      if (pkgRes.success && pkgRes.data) setPackages(pkgRes.data);
      if (vendorRes.success && vendorRes.data) setVendors(vendorRes.data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    const q = debouncedCustomerName.trim();
    // Nothing to search once a result's already been picked (the field now
    // holds their exact name) — search resumes the moment they edit it,
    // since editing clears selectedCustomerId below.
    if (q.length < 2 || selectedCustomerId) return;
    let cancelled = false;
    searchExistingCustomersAction(q).then((res) => {
      if (cancelled) return;
      setCustomerResults(res.success ? res.data ?? [] : []);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedCustomerName, selectedCustomerId]);

  const selectCustomer = (c: CustomerSearchResult) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerEmail(c.email);
    setSelectedCustomerId(c.id);
    setCustomerResults([]);
  };

  const addItemRow = () => setItems((prev) => [...prev, { packageId: "", quantity: 1 }]);
  const removeItemRow = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const updateItemRow = (index: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const itemsTotal = items.reduce((sum, row) => {
    const pkg = packages.find((p) => p.id === row.packageId);
    return sum + (pkg ? pkg.price * row.quantity : 0);
  }, 0);

  const submit = async () => {
    const validItems = items.filter((i) => i.packageId);
    if (validItems.length === 0) {
      toast.error("Add at least one package");
      return;
    }
    if (!customerName.trim() || !/^\d{10}$/.test(customerPhone) || !customerEmail.trim()) {
      toast.error("Fill in the customer's name, a 10-digit phone, and an email");
      return;
    }
    if (!location.address.trim() || !location.city.trim() || !location.state.trim() || !/^\d{6}$/.test(location.pincode)) {
      toast.error("Fill in the full address, city, state and a 6-digit pincode");
      return;
    }
    if (pins.startPin.length < 4 || pins.completionPin.length < 4 || pins.startPin === pins.completionPin) {
      toast.error("Start and complete PINs must each be at least 4 characters and different from each other");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await adminCreateLiveCallAction({
        customerName,
        customerPhone,
        customerEmail,
        address: location.address,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
        items: validItems,
        scheduledFor: isInstant || !scheduledFor ? null : new Date(scheduledFor).toISOString(),
        assignVendorId: assignMode === "assign" ? assignVendorId || null : null,
        startPin: pins.startPin,
        completionPin: pins.completionPin,
      });
      if (!res.success) {
        toast.error(res.error || "Failed to create this order");
        return;
      }
      toast.success(assignMode === "assign" ? "Call created and assigned" : "Call created and broadcast");
      onCreated();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  return (
    <Modal
      title="Create Live Call"
      onClose={onClose}
      maxWidthClass="sm:max-w-4xl"
      bodyClassName="p-4 sm:p-5"
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting || !loaded}
          className="w-full h-12 sm:h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] active:scale-[0.99] disabled:opacity-50 text-white text-sm font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            "Creating..."
          ) : (
            <>
              <ClientIcon icon="ph:plus-circle-bold" className="w-4 h-4" /> Create Call{itemsTotal > 0 ? ` — ₹${itemsTotal}` : ""}
            </>
          )}
        </button>
      }
    >
      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left column: who + where */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionLabel icon="ph:user-bold">Customer</SectionLabel>
              {selectedCustomerId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2 py-0.5">
                  <ClientIcon icon="ph:check-circle-bold" className="w-3 h-3" /> Existing customer
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative min-w-0">
                <input
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setSelectedCustomerId(null);
                  }}
                  placeholder="Search or type a full name"
                  className={inputClass}
                />
                {!selectedCustomerId && customerName.trim().length >= 2 && customerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="flex flex-col items-start gap-0.5 w-full text-left px-3.5 py-2.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{c.name || "—"}</span>
                        <span className="text-xs text-slate-400">
                          {c.phone}
                          {c.lastOrderCity ? ` · last order in ${c.lastOrderCity}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setSelectedCustomerId(null);
                }}
                placeholder="10-digit phone"
                inputMode="numeric"
                className={inputClass}
              />
            </div>
            <input
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                setSelectedCustomerId(null);
              }}
              placeholder="Email"
              className={inputClass}
            />
            <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
              <ClientIcon icon="ph:info-bold" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Search picks an existing customer and fills their details in. If this phone isn&apos;t registered yet, a new customer account is created automatically.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <SectionLabel icon="ph:map-pin-bold">Address</SectionLabel>
            <AdminLocationPicker value={location} onChange={setLocation} />
          </div>
        </div>

        {/* Right column: what + when + who fulfills it */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionLabel icon="ph:package-bold">Packages</SectionLabel>
              {itemsTotal > 0 && <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Subtotal ₹{itemsTotal}</span>}
            </div>
            <div className="flex flex-col gap-2.5">
              {items.map((row, i) => {
                const pkg = packages.find((p) => p.id === row.packageId);
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 p-3 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <select
                        value={row.packageId}
                        onChange={(e) => updateItemRow(i, { packageId: e.target.value })}
                        className={`${inputClass} flex-1 min-w-0`}
                      >
                        <option value="">Select a package</option>
                        {packages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₹{p.price} ({p.serviceTitle})
                          </option>
                        ))}
                      </select>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(i)}
                          className="w-11 h-11 shrink-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <ClientIcon icon="ph:trash-bold" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {pkg ? `₹${pkg.price * row.quantity} total` : "Quantity"}
                      </span>
                      <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-1 py-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateItemRow(i, { quantity: Math.max(1, row.quantity - 1) })}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <ClientIcon icon="ph:minus-bold" className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{row.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemRow(i, { quantity: Math.min(20, row.quantity + 1) })}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <ClientIcon icon="ph:plus-bold" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs font-bold text-[#00B4FF] hover:text-blue-600 cursor-pointer self-start flex items-center gap-1 py-1"
            >
              <ClientIcon icon="ph:plus-bold" className="w-3.5 h-3.5" /> Add another package
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <SectionLabel icon="ph:calendar-bold">Schedule</SectionLabel>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-11">
              <button
                type="button"
                onClick={() => setIsInstant(true)}
                className={`flex-1 text-xs font-bold cursor-pointer transition-colors ${isInstant ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                Instant
              </button>
              <button
                type="button"
                onClick={() => setIsInstant(false)}
                className={`flex-1 text-xs font-bold cursor-pointer transition-colors ${!isInstant ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                Scheduled
              </button>
            </div>
            {!isInstant && (
              <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className={inputClass} />
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <SectionLabel icon="ph:handshake-bold">Assignment</SectionLabel>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-11">
              <button
                type="button"
                onClick={() => setAssignMode("broadcast")}
                className={`flex-1 text-xs font-bold cursor-pointer transition-colors px-1 ${assignMode === "broadcast" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                Broadcast — vendors buy it
              </button>
              <button
                type="button"
                onClick={() => setAssignMode("assign")}
                className={`flex-1 text-xs font-bold cursor-pointer transition-colors ${assignMode === "assign" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                Assign directly
              </button>
            </div>
            {assignMode === "assign" && (
              <>
                <select value={assignVendorId} onChange={(e) => setAssignVendorId(e.target.value)} className={inputClass}>
                  <option value="">Select a vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.isActive}>
                      {v.companyName}
                      {!v.isActive ? " (deactivated)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Direct assignment is free — no wallet charge to the vendor.</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <SectionLabel icon="ph:key-bold">Job PINs</SectionLabel>
            <div className="flex gap-2.5">
              <PinField
                label="To start"
                value={pins.startPin}
                onChange={(v) => setPins((p) => ({ ...p, startPin: v }))}
                onRegenerate={() =>
                  setPins((p) => {
                    let next = generatePin();
                    while (next === p.completionPin) next = generatePin();
                    return { ...p, startPin: next };
                  })
                }
              />
              <PinField
                label="To complete"
                value={pins.completionPin}
                onChange={(v) => setPins((p) => ({ ...p, completionPin: v }))}
                onRegenerate={() =>
                  setPins((p) => {
                    let next = generatePin();
                    while (next === p.startPin) next = generatePin();
                    return { ...p, completionPin: next };
                  })
                }
              />
            </div>
            <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
              <ClientIcon icon="ph:info-bold" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Auto-generated, unique to this order. Hand these to the customer — the technician asks for the first to start and the second to close out the job.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
