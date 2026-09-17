"use client";

import React, { useEffect, useRef, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { IdCardPreview, type IdCardPreviewData } from "./IdCardPreview";

const CARD_WIDTH = 360;
const CARD_HEIGHT = 580;

export function TechnicianIdCardTab({ data }: { data: IdCardPreviewData | null }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setScale(Math.min(1, width / CARD_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!data) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">Your ID card isn&apos;t ready yet.</p>;
  }

  const downloadImage = async () => {
    if (!captureRef.current) return;
    setError(null);
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, cacheBust: true });
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
    <div className="relative flex flex-col items-center gap-5 py-2">
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

      {/* Scaled-to-fit visible preview — the card is a fixed 360x580px
          element (IdCardPreview's own size), so on a narrow phone it's
          wrapped in a measured, CSS-scaled container rather than left to
          overflow/scroll. Purely decorative: never what "Download as
          Image" actually captures. */}
      <div ref={containerRef} className="w-full max-w-sm flex justify-center">
        <div style={{ width: CARD_WIDTH * scale, height: CARD_HEIGHT * scale }}>
          <div style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <IdCardPreview data={data} />
          </div>
        </div>
      </div>

      {/* Full-resolution, off-screen twin — always captured at the real
          360x580px regardless of viewport width, so the downloaded PNG
          never loses quality to the on-screen scaling above. */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <IdCardPreview ref={captureRef} data={data} />
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
