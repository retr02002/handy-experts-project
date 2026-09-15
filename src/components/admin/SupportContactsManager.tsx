"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import {
  createSupportContactAction,
  updateSupportContactAction,
  setSupportContactActiveAction,
  deleteSupportContactAction,
  type SupportContactItem,
} from "@/actions/supportcontact.actions";

const EMPTY_FORM = {
  type: "PHONE" as "PHONE" | "EMAIL",
  label: "",
  value: "",
  sortOrder: "0",
};

/**
 * Add/edit/delete list for the platform's support contacts — structurally
 * the same shape as CategoriesManager (form up top, list below, inline
 * active toggle), not shared code with it since categories carry a lot more
 * fields this doesn't need.
 */
export function SupportContactsManager({ initialContacts }: { initialContacts: SupportContactItem[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const startEdit = (c: SupportContactItem) => {
    setEditingId(c.id);
    setForm({ type: c.type, label: c.label, value: c.value, sortOrder: String(c.sortOrder) });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const basePayload = { type: form.type, label: form.label, value: form.value, sortOrder: Number(form.sortOrder) || 0 };

      if (editingId) {
        const existing = contacts.find((c) => c.id === editingId);
        const payload = { ...basePayload, isActive: existing?.isActive ?? true };
        const res = await updateSupportContactAction(editingId, payload);
        if (!res.success) {
          if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
          toast.error(res.error || "Please fix the highlighted fields");
          return;
        }
        setContacts((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c)).sort((a, b) => a.sortOrder - b.sortOrder)
        );
        toast.success("Contact updated");
      } else {
        const payload = { ...basePayload, isActive: true };
        const res = await createSupportContactAction(payload);
        if (!res.success) {
          if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
          toast.error(res.error || "Please fix the highlighted fields");
          return;
        }
        const id = res.data?.id ?? crypto.randomUUID();
        setContacts((prev) => [...prev, { id, ...payload }].sort((a, b) => a.sortOrder - b.sortOrder));
        toast.success("Contact added");
      }
      cancelEdit();
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (c: SupportContactItem) => {
    setBusyId(c.id);
    try {
      const res = await setSupportContactActiveAction(c.id, !c.isActive);
      if (!res.success) {
        toast.error(res.error || "Couldn't update this contact");
        return;
      }
      setContacts((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this contact? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await deleteSupportContactAction(id);
      if (!res.success) {
        toast.error(res.error || "Couldn't delete this contact");
        return;
      }
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contact removed");
    } finally {
      setBusyId(null);
    }
  };

  const inputClass =
    "w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={submit}
        className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3"
      >
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {editingId ? "Edit contact" : "Add a contact"}
        </p>
        <div className="grid sm:grid-cols-[120px_1fr] gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value as "PHONE" | "EMAIL")} className={inputClass}>
              <option value="PHONE">Phone</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Label</label>
            <input
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="e.g. Billing, Technical, General"
              className={inputClass}
            />
            {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
            {form.type === "PHONE" ? "Phone number" : "Email address"}
          </label>
          <input
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder={form.type === "PHONE" ? "+91 98765 43210" : "support@example.com"}
            className={inputClass}
          />
          {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value}</p>}
        </div>
        <div className="w-28">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Sort order</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer transition-colors"
          >
            {isSaving ? "Saving..." : editingId ? "Save changes" : "Add contact"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="h-10 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {contacts.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
          <ClientIcon icon="ph:phone-list" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No support contacts yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {contacts.map((c) => (
            <div key={c.id} className="p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <ClientIcon icon={c.type === "PHONE" ? "ph:phone-fill" : "ph:envelope-simple-fill"} className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.value}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(c)}
                disabled={busyId === c.id}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 disabled:opacity-50 cursor-pointer ${
                  c.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {c.isActive ? "Active" : "Hidden"}
              </button>
              <button
                type="button"
                onClick={() => startEdit(c)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                aria-label={`Edit ${c.label}`}
              >
                <ClientIcon icon="ph:pencil-simple-bold" className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(c.id)}
                disabled={busyId === c.id}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer transition-colors"
                aria-label={`Delete ${c.label}`}
              >
                <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
