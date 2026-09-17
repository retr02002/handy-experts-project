"use client";

import React from "react";

export interface IdCardPreviewData {
  platformName: string;
  platformTagline: string;
  name: string;
  role: string;
  idNumber: string;
  photoDataUri: string | null;
  signatureDataUri: string | null;
  experienceLabel: string;
  ratingLabel: string;
  vendor: { name: string; logoDataUri: string | null } | null;
}

/**
 * HTML/CSS twin of IdCardDocument.tsx (the PDF version) at the same 360x580
 * proportions, so the "Download as Image" (html-to-image raster of this
 * div) and "Download as PDF" (react-pdf, server-side) buttons produce
 * visually matching cards. Fixed pixel size, not responsive — html-to-image
 * needs a predictable canvas to rasterize regardless of viewport width. The
 * Handyzo mark references the static /favicon asset directly rather than a
 * passed-in data URI — it's a same-origin public file, not a bucket object.
 */
export const IdCardPreview = React.forwardRef<HTMLDivElement, { data: IdCardPreviewData }>(function IdCardPreview(
  { data },
  ref
) {
  const wordmarkSplit = data.platformName.length > 5 ? data.platformName.slice(0, 5) : data.platformName;
  const wordmarkAccent = data.platformName.length > 5 ? data.platformName.slice(5) : "";

  return (
    <div ref={ref} className="relative w-[360px] h-[580px] bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 shrink-0">
      <div className="flex flex-col items-center pt-5 pb-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon/android-chrome-192x192.png" alt="" className="w-6 h-6 rounded-md" />
          <span className="font-black text-xl tracking-tight text-slate-900">
            {wordmarkSplit.toUpperCase()}
            <span className="text-[#00B4FF]">{wordmarkAccent.toUpperCase()}</span>
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 tracking-wide">{data.platformTagline}</p>
      </div>

      <div className="flex justify-center">
        <div className="w-[92px] h-[92px] rounded-full border-[3px] border-[#e0f6ff] overflow-hidden bg-slate-200">
          {data.photoDataUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoDataUri} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No photo</div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mt-2 px-4">
        <p className="text-lg font-bold text-slate-900 text-center leading-tight">{data.name}</p>
        <span className="mt-1 px-2.5 py-0.5 rounded-lg bg-[#e0f6ff] text-[#00B4FF] text-[11px] font-bold tracking-wide">
          TECHNICIAN
        </span>
        <p className="text-xs text-slate-400 mt-1.5">
          {data.role} · {data.experienceLabel} · {data.ratingLabel}
        </p>
      </div>

      <div className="mx-4 mt-3 border-t border-slate-100" />

      <div className="mx-4 mt-1">
        <DetailRow label="Technician ID" value={data.idNumber} />
        <DetailRow label="Category" value={data.role} />
        <DetailRow
          label="Vendor"
          value={data.vendor ? data.vendor.name : "Independent"}
          logoDataUri={data.vendor?.logoDataUri ?? null}
          last
        />
      </div>

      <div className="mx-4 mt-1 border-t border-slate-100" />

      <div className="mx-4 mt-3 flex flex-col items-center">
        {data.signatureDataUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.signatureDataUri} alt="" className="w-[120px] h-[40px] object-contain" />
        ) : (
          <div className="w-[120px] h-[40px] border border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-[10px] text-slate-400">Not signed</span>
          </div>
        )}
        <div className="w-[120px] border-t border-slate-900 mt-0.5" />
        <p className="text-[9px] text-slate-400 mt-1">Authorized Signature</p>
      </div>

      <p className="absolute bottom-3 left-4 right-4 text-[8px] text-slate-400 text-center">
        This card is property of {data.platformName}. If found, please contact support.
      </p>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#00B4FF]" />
    </div>
  );
});

function DetailRow({
  label,
  value,
  logoDataUri,
  last,
}: {
  label: string;
  value: string;
  logoDataUri?: string | null;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${last ? "" : "border-b border-slate-100"}`}>
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="flex items-center gap-1 min-w-0">
        {logoDataUri && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoDataUri} alt="" className="w-3 h-3 object-contain shrink-0" />
        )}
        <span className="text-xs font-bold text-slate-900 text-right max-w-[180px] truncate">{value}</span>
      </span>
    </div>
  );
}
