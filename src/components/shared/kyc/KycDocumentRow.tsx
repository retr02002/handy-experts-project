"use client";

import React, { useRef, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { KycDocSummary } from "@/actions/kyc.actions";

const ALLOWED_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

/**
 * XHR rather than fetch, same reason as JobPhotoUploader: fetch has no
 * upload-progress event, and a KYC upload with no feedback on a slow
 * connection looks broken.
 */
export function uploadKycDocument(
  file: File,
  documentType: string,
  label: string | null,
  onProgress: (pct: number) => void
): Promise<{ ok: true; doc: KycDocSummary } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("file", file);
    form.append("documentType", documentType);
    if (label) form.append("label", label);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/kyc-document");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ ok: true, doc: JSON.parse(xhr.responseText) });
          return;
        } catch {
          // fall through to generic failure below
        }
      }
      let message = "Upload failed";
      try {
        message = JSON.parse(xhr.responseText).error || message;
      } catch {
        // response wasn't JSON — keep the generic message
      }
      resolve({ ok: false, error: message });
    };
    xhr.onerror = () => resolve({ ok: false, error: "Network error" });
    xhr.send(form);
  });
}

interface Props {
  icon: string;
  label: string;
  documentType: string;
  document: KycDocSummary | null;
  /** Hides Upload/Replace/Remove — used on the admin/vendor read-only Documents tabs. */
  readOnly?: boolean;
  helperText?: string;
  onChange?: (next: KycDocSummary) => void;
  onDelete?: (id: string) => Promise<void> | void;
  /** When set, Upload/Replace opens this instead of a file picker — used for the signature row's draw-pad modal. */
  onTriggerCapture?: () => void;
}

export function KycDocumentRow({
  icon,
  label,
  documentType,
  document,
  readOnly,
  helperText,
  onChange,
  onDelete,
  onTriggerCapture,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);
    const result = await uploadKycDocument(file, documentType, null, setProgress);
    setProgress(null);
    if (result.ok) {
      onChange?.(result.doc);
    } else {
      setError(result.error);
    }
  };

  const isPdf = document?.contentType === "application/pdf";

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
        {document ? (
          isPdf ? (
            <ClientIcon icon="ph:file-pdf-fill" className="w-5 h-5 text-rose-500" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={document.url} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <ClientIcon icon={icon} className="w-5 h-5 text-slate-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{label}</p>
        {document ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Uploaded{" "}
            {new Date(document.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        ) : progress !== null ? (
          <p className="text-[11px] text-[#00B4FF] font-semibold">Uploading… {progress}%</p>
        ) : (
          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
            <ClientIcon icon="ph:warning-circle-fill" className="w-3 h-3" />
            Pending
          </span>
        )}
        {error && <p className="text-[11px] text-rose-500 mt-0.5">{error}</p>}
        {helperText && !document && progress === null && <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {document && (
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            View
          </a>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={() => (onTriggerCapture ? onTriggerCapture() : inputRef.current?.click())}
            disabled={progress !== null}
            className="h-9 px-3 rounded-lg bg-[#00B4FF] text-white text-xs font-bold flex items-center disabled:opacity-50 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {document ? "Replace" : "Upload"}
          </button>
        )}
        {!readOnly && document && onDelete && (
          <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              await onDelete(document.id);
              setDeleting(false);
            }}
            aria-label="Remove"
            className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
          >
            <ClientIcon icon="ph:trash" className="w-4 h-4" />
          </button>
        )}
      </div>

      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      )}
    </div>
  );
}
