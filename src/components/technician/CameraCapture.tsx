"use client";

import React, { useEffect, useRef, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { uploadKycDocument } from "@/components/shared/kyc/KycDocumentRow";

/** Longest edge after downscale — a permanent ID photo, so a touch higher quality than job photos. */
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.85;

type Stage = "requesting" | "live" | "denied" | "unsupported" | "review" | "uploading" | "error";

async function downscale(source: HTMLCanvasElement): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error("Could not process the photo");
  return blob;
}

/**
 * Front-camera live capture for the mandatory profile-photo step. Falls
 * back to a plain file picker (still capture="user") when getUserMedia is
 * unsupported or permission is denied — the requirement that a photo gets
 * uploaded stays, but the app never hard-blocks someone whose browser or
 * settings won't allow a camera stream.
 */
export function CameraCapture({ onUploaded }: { onUploaded: () => void }) {
  const [stage, setStage] = useState<Stage>("requesting");
  const [error, setError] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedBlobRef = useRef<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStage("unsupported");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStage("live");
      } catch (err) {
        if (cancelled) return;
        setStage(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "unsupported");
      }
    }

    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const blob = await downscale(canvas);
    capturedBlobRef.current = blob;
    setReviewUrl(URL.createObjectURL(blob));
    setStage("review");
  };

  const retake = () => {
    if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    setReviewUrl(null);
    capturedBlobRef.current = null;
    setStage("live");
  };

  const submit = async (blob: Blob) => {
    setStage("uploading");
    setError(null);
    const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
    const result = await uploadKycDocument(file, "PHOTO", null, () => {});
    if (result.ok) {
      onUploaded();
    } else {
      setError(result.error);
      setStage("error");
    }
  };

  const handleFileFallback = (file: File) => {
    void submit(file);
  };

  if (stage === "unsupported" || stage === "denied") {
    return (
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <ClientIcon icon="ph:camera-slash" className="w-7 h-7" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
          {stage === "denied"
            ? "Camera access was denied. Upload a photo instead."
            : "Your browser doesn't support the camera here. Upload a photo instead."}
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-12 px-6 rounded-xl bg-[#00B4FF] text-white text-sm font-bold flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <ClientIcon icon="ph:image-bold" className="w-4 h-4" /> Choose a photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFileFallback(file);
          }}
        />
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <p className="text-sm text-rose-500">{error}</p>
        <button
          type="button"
          onClick={retake}
          className="h-11 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (stage === "uploading") {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <div className="w-8 h-8 border-2 border-[#00B4FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Uploading…</p>
      </div>
    );
  }

  if (stage === "review" && reviewUrl) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reviewUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={retake}
            className="h-12 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold cursor-pointer"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={() => capturedBlobRef.current && submit(capturedBlobRef.current)}
            className="h-12 px-6 rounded-xl bg-[#00B4FF] text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Use this photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-64 h-64 rounded-2xl overflow-hidden bg-slate-900 relative">
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover -scale-x-100" />
        {stage === "requesting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={capture}
        disabled={stage !== "live"}
        className="h-14 w-14 rounded-full bg-white border-4 border-[#00B4FF] disabled:opacity-40 cursor-pointer"
        aria-label="Capture photo"
      />
    </div>
  );
}
