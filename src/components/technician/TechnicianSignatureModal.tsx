"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { uploadKycDocument } from "@/components/shared/kyc/KycDocumentRow";
import type { KycDocSummary } from "@/actions/kyc.actions";

interface Props {
  onClose: () => void;
  onSaved: (doc: KycDocSummary) => void;
}

/**
 * The technician's own e-signature — drawn once, reused as "Authorized
 * Signature" on every ID card download. Canvas/touch mechanics are a copy
 * of SignaturePad.tsx (customer job-completion signature), not a shared
 * import: that component's save() is tightly coupled to the job-signature
 * upload route and a signerName field neither applies here, so sharing one
 * component would mean branching it for two unrelated targets over ~60
 * lines of drawing logic — not worth the abstraction.
 *
 * Canvas background is always white (no dark-mode variant) regardless of
 * the app's theme — the signature is captured once and then embedded into
 * a white PDF page and a white ID-card preview, so ink-on-white contrast
 * must hold regardless of what theme the technician happened to be in.
 */
export function TechnicianSignatureModal({ onClose, onSaved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // A ResizeObserver (not a one-shot mount measurement) re-runs this
    // whenever the canvas's actual rendered size changes, so the backing
    // store can never drift out of sync with what pointFrom reads live
    // from getBoundingClientRect() on every stroke.
    const applySize = () => {
      // Resizing the canvas element always clears its contents — once
      // there's ink to lose, a late resize must not wipe it.
      if (hasInk.current) return;
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointFrom(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointFrom(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk.current) {
      toast.error("Sign in the box first.");
      return;
    }
    setIsSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        toast.error("Couldn't capture the signature.");
        return;
      }
      const file = new File([blob], "signature.png", { type: "image/png" });
      const result = await uploadKycDocument(file, "SIGNATURE", null, () => {});
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Signature saved");
      onSaved(result.doc);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Your Signature" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign with your finger — this appears as your &quot;Authorized Signature&quot; on your ID card.
        </p>

        {/* touch-none stops the sheet scrolling while someone signs;
            overscroll-contain stops an iOS rubber-band bounce from the
            Modal's scrollable body perturbing an in-progress stroke. */}
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-white touch-none overscroll-contain"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={clear}
            className="h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="h-11 rounded-xl bg-[#00B4FF] text-white text-sm font-bold disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {isSaving ? "Saving…" : "Save Signature"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
