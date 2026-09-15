"use client";

import React, { useEffect, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getJobPhotosAction, type JobPhotoItem } from "@/actions/jobphoto.actions";

/**
 * Read-only before/after photos for whoever is reviewing a job — vendor,
 * admin, or the customer. Fetches on mount rather than taking photos as a
 * prop, since every caller already has the service-call id and none of
 * them want a second round of prop plumbing for an optional extra.
 *
 * Plain <img>: these are already downscaled to ~1600px at capture time, so
 * routing them through the image optimizer would add cost for no gain.
 */
export function JobPhotoGallery({ serviceCallId }: { serviceCallId: string }) {
  const [photos, setPhotos] = useState<JobPhotoItem[] | null>(null);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getJobPhotosAction(serviceCallId).then((res) => {
      if (cancelled) return;
      setPhotos(res.success && res.data ? res.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceCallId]);

  if (!photos || photos.length === 0) return null;

  const before = photos.filter((p) => p.phase === "BEFORE");
  const after = photos.filter((p) => p.phase === "AFTER");

  const section = (title: string, items: JobPhotoItem[]) =>
    items.length === 0 ? null : (
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="grid grid-cols-3 gap-2">
          {items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setZoomUrl(p.url)}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={title} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {section("Before", before)}
      {section("After", after)}

      {zoomUrl && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={() => setZoomUrl(null)}
        >
          <button
            type="button"
            onClick={() => setZoomUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center cursor-pointer"
          >
            <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomUrl} alt="Job photo" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
