"use client";

import React, { useRef, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { deletePlatformDocumentAction, type PlatformDocumentSummary } from "@/actions/platformDocument.actions";

function uploadPlatformDocument(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ ok: true; doc: PlatformDocumentSummary } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", "VENDOR_AGREEMENT");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/platform-document");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ ok: true, doc: JSON.parse(xhr.responseText) });
          return;
        } catch {
          // fall through
        }
      }
      let message = "Upload failed";
      try {
        message = JSON.parse(xhr.responseText).error || message;
      } catch {
        // response wasn't JSON
      }
      resolve({ ok: false, error: message });
    };
    xhr.onerror = () => resolve({ ok: false, error: "Network error" });
    xhr.send(form);
  });
}

export function AgreementTemplateCard({ initial }: { initial: PlatformDocumentSummary | null }) {
  const [doc, setDoc] = useState(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);
    const result = await uploadPlatformDocument(file, setProgress);
    setProgress(null);
    if (result.ok) {
      setDoc(result.doc);
    } else {
      setError(result.error);
    }
  };

  const remove = async () => {
    setRemoving(true);
    await deletePlatformDocumentAction("VENDOR_AGREEMENT");
    setDoc(null);
    setRemoving(false);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-xl">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <ClientIcon icon="ph:file-text" className="text-blue-500 w-5 h-5" />
        Vendor Agreement Template
      </h2>
      <p className="text-xs text-slate-400 mb-5">
        The blank agreement every vendor downloads, prints, signs, and uploads back through their own Documents
        section. PDF only. Replacing it doesn&apos;t touch any vendor&apos;s already-uploaded signed copy.
      </p>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
          <ClientIcon icon="ph:file-pdf-fill" className="w-6 h-6 text-rose-500" />
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {doc ? (
            <>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Current template</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Uploaded by {doc.uploadedByName} ·{" "}
                {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">No template uploaded yet — vendors won&apos;t see a download link until you add one.</p>
          )}
          {progress !== null && <p className="text-xs text-[#00B4FF] font-semibold">Uploading… {progress}%</p>}
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {doc && (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            View
          </a>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="h-10 px-4 rounded-lg bg-[#00B4FF] text-white text-xs font-bold disabled:opacity-50 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {doc ? "Replace" : "Upload template"}
        </button>
        {doc && (
          <button
            type="button"
            onClick={remove}
            disabled={removing}
            className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 text-xs font-bold disabled:opacity-50 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
