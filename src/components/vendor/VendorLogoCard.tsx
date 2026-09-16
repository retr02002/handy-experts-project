"use client";

import React, { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { deleteVendorLogoAction } from "@/actions/kyc.actions";

function uploadLogo(file: File, onProgress: (pct: number) => void): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/vendor-logo");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ ok: true, url: JSON.parse(xhr.responseText).url });
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

export function VendorLogoCard({ initialLogoUrl }: { initialLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { update } = useSession();

  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);
    const result = await uploadLogo(file, setProgress);
    setProgress(null);
    if (result.ok) {
      setLogoUrl(result.url);
      // Keeps the navbar avatar in sync with the freshly uploaded logo
      // without requiring a logout/login — see the jwt callback's "update" trigger.
      void update();
    } else {
      setError(result.error);
    }
  };

  const remove = async () => {
    setRemoving(true);
    await deleteVendorLogoAction();
    setLogoUrl(null);
    void update();
    setRemoving(false);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <ClientIcon icon="ph:image-square" className="text-blue-500 w-5 h-5" />
        Company Logo
      </h2>
      <p className="text-xs text-slate-400 mb-5">
        Optional. Used on your invoices and technician ID cards. PNG or JPG, square works best.
      </p>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <ClientIcon icon="ph:image-square" className="w-7 h-7 text-slate-300" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          {progress !== null && <p className="text-xs text-[#00B4FF] font-semibold">Uploading… {progress}%</p>}
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={progress !== null}
              className="h-10 px-4 rounded-lg bg-[#00B4FF] text-white text-xs font-bold disabled:opacity-50 cursor-pointer hover:opacity-90 transition-opacity"
            >
              {logoUrl ? "Replace" : "Upload logo"}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={remove}
                disabled={removing}
                className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold disabled:opacity-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
