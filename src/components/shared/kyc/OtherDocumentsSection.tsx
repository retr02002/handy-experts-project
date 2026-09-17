"use client";

import React, { useRef, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { KycDocSummary } from "@/actions/kyc.actions";
import { uploadKycDocument } from "./KycDocumentRow";

interface Props {
  documents: KycDocSummary[];
  readOnly?: boolean;
  onAdded?: (doc: KycDocSummary) => void;
  onDeleted?: (id: string) => Promise<void> | void;
}

/**
 * The open-ended "more documentation" case — unlike Aadhar/PAN/GST/Photo,
 * OTHER isn't a singleton per owner, so this is an add-another list rather
 * than a fixed row.
 */
export function OtherDocumentsSection({ documents, readOnly, onAdded, onDeleted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingLabel, setPendingLabel] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const label = pendingLabel.trim();
    if (!label) {
      setError("Add a short label first, e.g. \"Electricity Bill\"");
      return;
    }
    setError(null);
    setProgress(0);
    const result = await uploadKycDocument(file, "OTHER", label, setProgress);
    setProgress(null);
    if (result.ok) {
      onAdded?.(result.doc);
      setPendingLabel("");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Other documents</p>

      {documents.length === 0 && readOnly && <p className="text-sm text-slate-400">No other documents uploaded.</p>}

      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              {doc.contentType === "application/pdf" ? (
                <ClientIcon icon="ph:file-pdf-fill" className="w-5 h-5 text-rose-500" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.label ?? "Document"}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 sm:ml-auto">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 sm:h-9 px-3 flex-1 sm:flex-none rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              View
            </a>
            {!readOnly && onDeleted && (
              <button
                type="button"
                disabled={deletingId === doc.id}
                onClick={async () => {
                  setDeletingId(doc.id);
                  await onDeleted(doc.id);
                  setDeletingId(null);
                }}
                aria-label="Remove"
                className="h-10 sm:h-9 w-11 sm:w-9 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
              >
                <ClientIcon icon="ph:trash" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {!readOnly && (
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <input
            type="text"
            value={pendingLabel}
            onChange={(e) => setPendingLabel(e.target.value)}
            placeholder="Document name, e.g. Trade License"
            maxLength={200}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null || !pendingLabel.trim()}
            className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ClientIcon icon="ph:plus-bold" className="w-3.5 h-3.5" />
            {progress !== null ? `Uploading… ${progress}%` : "Add another document"}
          </button>
          {error && <p className="text-[11px] text-rose-500">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void handleFile(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
