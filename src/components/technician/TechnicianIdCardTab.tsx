"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { IdCardPreview, type IdCardPreviewData } from "./IdCardPreview";

export function TechnicianIdCardTab({ data }: { data: IdCardPreviewData | null }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">Your ID card isn&apos;t ready yet.</p>;
  }

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setError(null);
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "handyzo-id-card.png";
      a.click();
    } catch {
      setError("Couldn't generate the image. Try the PDF download instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {(!data.photoDataUri || !data.signatureDataUri) && (
        <div className="w-full max-w-sm flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold">
          <ClientIcon icon="ph:warning-circle-fill" className="w-4 h-4 shrink-0" />
          {!data.photoDataUri && !data.signatureDataUri
            ? "Add a profile photo and signature in the Documents tab for a complete card."
            : !data.photoDataUri
              ? "Add a profile photo in the Documents tab for a complete card."
              : "Add your signature in the Documents tab for a complete card."}
        </div>
      )}

      <div className="overflow-x-auto w-full flex justify-center py-1">
        <IdCardPreview ref={cardRef} data={data} />
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        <a
          href="/api/technician/id-card"
          download
          className="flex-1 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ClientIcon icon="ph:file-pdf-bold" className="w-4 h-4" />
          PDF
        </a>
        <button
          type="button"
          onClick={downloadImage}
          disabled={downloading}
          className="flex-1 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:border-[#00B4FF] transition-colors"
        >
          <ClientIcon icon="ph:image-bold" className="w-4 h-4" />
          {downloading ? "Preparing…" : "Image"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
