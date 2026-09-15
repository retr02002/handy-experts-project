"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface Props {
  serviceCallId: string;
  /** Pre-fills the signer field; still editable, since whoever is on site often isn't the account holder. */
  defaultSignerName: string;
  onSaved?: (url: string) => void;
}

/**
 * Customer signs with a finger on the technician's phone. Optional by
 * design: a customer who won't sign must not be able to block the
 * technician from closing the job, so the documents fall back to a
 * PIN-verified acknowledgement line instead.
 */
export function SignaturePad({ serviceCallId, defaultSignerName, onSaved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Backing store is sized to the device pixel ratio so strokes aren't
    // blurry on a phone screen, then scaled back down for drawing coords.
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
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
    setSavedUrl(null);
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk.current) {
      toast.error("Ask the customer to sign in the box first.");
      return;
    }
    if (signerName.trim().length < 2) {
      toast.error("Enter who signed.");
      return;
    }

    setIsSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        toast.error("Couldn't capture the signature");
        return;
      }
      const form = new FormData();
      form.append("file", blob, "signature.png");
      form.append("serviceCallId", serviceCallId);
      form.append("signerName", signerName.trim());

      const res = await fetch("/api/upload/job-signature", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't save the signature");
        return;
      }
      setSavedUrl(data.url);
      onSaved?.(data.url);
      toast.success("Signature saved");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
          Customer signature <span className="font-normal text-slate-400">· optional</span>
        </p>
        {savedUrl && (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ClientIcon icon="ph:check-circle-bold" className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <input
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        placeholder="Who is signing?"
        className="w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
      />

      {/* touch-none stops the browser scrolling the sheet while someone signs */}
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full h-44 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 touch-none"
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
          className="h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? "Saving..." : savedUrl ? "Re-sign" : "Save signature"}
        </button>
      </div>
    </div>
  );
}
