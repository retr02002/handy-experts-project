"use client";

import React, { useEffect, useRef, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { JOB_PHOTO_MAX_PER_PHASE } from "@/lib/constants";

interface Props {
  serviceCallId: string;
  phase: "BEFORE" | "AFTER";
  onCountChange?: (count: number) => void;
}

interface Slot {
  localId: string;
  previewUrl: string;
  status: "uploading" | "done" | "failed";
  progress: number;
  error?: string;
}

/** Longest edge after downscale. A 4MB phone photo lands around 250KB. */
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.75;
const MAX_CONCURRENT = 2;

/**
 * Shrinks a photo in the browser before it ever hits the network. This is
 * the single biggest thing that makes uploads survive a weak mobile
 * connection — and it costs nothing visually, since these are viewed as
 * thumbnails and in a PDF, never at 12 megapixels.
 */
async function downscale(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 900_000) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    return blob ?? file;
  } catch {
    // An exotic format createImageBitmap can't read still uploads as-is.
    return file;
  }
}

/**
 * XHR rather than fetch: fetch has no upload-progress event, and on a slow
 * connection a tile that just sits there looks broken.
 */
function upload(
  blob: Blob,
  filename: string,
  serviceCallId: string,
  phase: string,
  onProgress: (pct: number) => void
): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("file", blob, filename);
    form.append("serviceCallId", serviceCallId);
    form.append("phase", phase);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/job-photo");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve({ ok: true });
      let message = "Upload failed";
      try {
        message = JSON.parse(xhr.responseText).error || message;
      } catch {}
      resolve({ ok: false, error: message });
    };
    xhr.onerror = () => resolve({ ok: false, error: "Network error" });
    xhr.send(form);
  });
}

export function JobPhotoUploader({ serviceCallId, phase, onCountChange }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const activeCount = useRef(0);
  const queue = useRef<string[]>([]);
  const filesRef = useRef<Map<string, File>>(new Map());

  const doneCount = slots.filter((s) => s.status === "done").length;
  useEffect(() => {
    onCountChange?.(doneCount);
  }, [doneCount, onCountChange]);

  // Object URLs for previews are revoked on unmount, not per-slot, so a
  // thumbnail never blanks out while its upload is still in flight.
  useEffect(() => {
    return () => slots.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (localId: string, next: Partial<Slot>) =>
    setSlots((prev) => prev.map((s) => (s.localId === localId ? { ...s, ...next } : s)));

  const pump = () => {
    while (activeCount.current < MAX_CONCURRENT && queue.current.length > 0) {
      const localId = queue.current.shift()!;
      activeCount.current++;
      void runSlot(localId);
    }
  };

  const runSlot = async (localId: string) => {
    const file = filesRef.current.get(localId);
    if (!file) {
      activeCount.current--;
      return;
    }
    patch(localId, { status: "uploading", progress: 0, error: undefined });

    const blob = await downscale(file);
    const result = await upload(blob, file.name || "photo.jpg", serviceCallId, phase, (pct) =>
      patch(localId, { progress: pct })
    );

    patch(
      localId,
      result.ok ? { status: "done", progress: 100 } : { status: "failed", error: result.error }
    );
    activeCount.current--;
    pump();
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = JOB_PHOTO_MAX_PER_PHASE - slots.filter((s) => s.status !== "failed").length;
    const accepted = Array.from(files).slice(0, Math.max(0, room));

    const newSlots: Slot[] = accepted.map((file) => {
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      // The File itself lives in a ref, not in state: it's never rendered,
      // and keeping it out of state means the async worker can read it
      // without a mirror of the slot list.
      filesRef.current.set(localId, file);
      return { localId, previewUrl: URL.createObjectURL(file), status: "uploading" as const, progress: 0 };
    });
    setSlots((prev) => [...prev, ...newSlots]);
    queue.current.push(...newSlots.map((s) => s.localId));
    pump();
  };

  const remove = (localId: string) => {
    setSlots((prev) => prev.filter((s) => s.localId !== localId));
  };

  const atCapacity = slots.filter((s) => s.status !== "failed").length >= JOB_PHOTO_MAX_PER_PHASE;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
          {phase === "BEFORE" ? "Before photos" : "After photos"}
          <span className="font-normal text-slate-400"> · optional</span>
        </p>
        {slots.length > 0 && (
          <span className="text-[11px] text-slate-400">
            {doneCount}/{JOB_PHOTO_MAX_PER_PHASE} uploaded
          </span>
        )}
      </div>

      {/* Two separate inputs: combining `capture` and `multiple` on one
          input behaves inconsistently across iOS and Android — one of the
          two silently wins depending on the browser. */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={atCapacity}
          onClick={() => cameraRef.current?.click()}
          className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <ClientIcon icon="ph:camera-bold" className="w-4 h-4" /> Take photo
        </button>
        <button
          type="button"
          disabled={atCapacity}
          onClick={() => galleryRef.current?.click()}
          className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <ClientIcon icon="ph:images-bold" className="w-4 h-4" /> Choose
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {slots.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s) => (
            <div
              key={s.localId}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.previewUrl} alt="" className="w-full h-full object-cover" />

              {s.status === "uploading" && (
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{s.progress}%</span>
                </div>
              )}

              {s.status === "failed" && (
                <button
                  type="button"
                  onClick={() => {
                    queue.current.push(s.localId);
                    pump();
                  }}
                  title={s.error}
                  className="absolute inset-0 bg-rose-900/60 flex flex-col items-center justify-center gap-1 text-white cursor-pointer"
                >
                  <ClientIcon icon="ph:arrow-clockwise-bold" className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Retry</span>
                </button>
              )}

              {s.status === "done" && (
                <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <ClientIcon icon="ph:check-bold" className="w-3 h-3 text-white" />
                </div>
              )}

              <button
                type="button"
                onClick={() => remove(s.localId)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center cursor-pointer"
              >
                <ClientIcon icon="ph:x-bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
