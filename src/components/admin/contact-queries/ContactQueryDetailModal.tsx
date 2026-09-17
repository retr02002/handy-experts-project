"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Input } from "@/components/ui/Input";
import {
  updateContactQueryAction,
  updateContactQueryStatusAction,
  deleteContactQueryAction,
  type AdminContactQuery,
  type ContactQueryReasonValue,
  type ContactQueryStatusValue,
} from "@/actions/contactquery.actions";
import { REASON_LABELS, STATUS_LABELS, STATUS_STYLES, STATUS_ORDER } from "./contactQueryStyles";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

interface Props {
  query: AdminContactQuery;
  onClose: () => void;
  onChanged: (patch: Partial<AdminContactQuery>) => void;
  onDeleted: () => void;
}

export function ContactQueryDetailModal({ query, onClose, onChanged, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: query.firstName,
    lastName: query.lastName,
    email: query.email,
    reason: query.reason as ContactQueryReasonValue,
    message: query.message,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adminNote, setAdminNote] = useState(query.adminNote ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const res = await updateContactQueryAction(query.id, form);
      if (!res.success) {
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        toast.error(res.error || "Please fix the highlighted fields");
        return;
      }
      onChanged(form);
      toast.success("Query updated");
      setEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (status: ContactQueryStatusValue) => {
    if (status === query.status) return;
    setIsChangingStatus(true);
    try {
      const res = await updateContactQueryStatusAction(query.id, status, adminNote);
      if (!res.success) {
        toast.error(res.error || "Couldn't update status");
        return;
      }
      onChanged({ status, resolvedAt: res.data?.resolvedAt ?? null });
      toast.success(`Marked as ${STATUS_LABELS[status]}`);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const saveNote = async () => {
    setIsChangingStatus(true);
    try {
      const res = await updateContactQueryStatusAction(query.id, query.status, adminNote);
      if (!res.success) {
        toast.error(res.error || "Couldn't save note");
        return;
      }
      onChanged({ adminNote });
      toast.success("Note saved");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this contact query? This can't be undone.")) return;
    setIsSaving(true);
    try {
      const res = await deleteContactQueryAction(query.id);
      if (!res.success) {
        toast.error(res.error || "Couldn't delete this query");
        return;
      }
      toast.success("Query deleted");
      onDeleted();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title={`${query.firstName} ${query.lastName}`} onClose={onClose}>
      {editing ? (
        <form onSubmit={saveEdit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input inputType="input" type="text" placeholder="First Name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Input inputType="input" type="text" placeholder="Last Name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <Input inputType="input" type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <Input
              inputType="select"
              placeholder="Reason"
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
            <Input inputType="textarea" rows={5} placeholder="Message" value={form.message} onChange={(e) => set("message", e.target.value)} />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-10 rounded-lg bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <a href={`mailto:${query.email}`} className="flex items-center gap-1.5 text-[#00B4FF] hover:underline">
              <ClientIcon icon="ph:envelope-simple-bold" className="w-3.5 h-3.5" />
              {query.email}
            </a>
            <span className={`px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[query.status]}`}>
              {STATUS_LABELS[query.status]}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ClientIcon icon="ph:question" className="w-3.5 h-3.5" /> {REASON_LABELS[query.reason]}
            </span>
            <span className="flex items-center gap-1">
              <ClientIcon icon="ph:calendar-blank" className="w-3.5 h-3.5" /> {formatDate(query.createdAt)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {query.message}
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => changeStatus(s)}
                  disabled={isChangingStatus || s === query.status}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer disabled:cursor-default ${
                    s === query.status
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admin Note</p>
            <div className="flex items-center gap-2">
              <input
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Internal note (not visible to the sender)"
                className="flex-1 h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="button"
                onClick={saveNote}
                disabled={isChangingStatus}
                className="h-10 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold disabled:opacity-60 cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ClientIcon icon="ph:pencil-simple-bold" className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="flex-1 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
