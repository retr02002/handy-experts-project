"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { ClientIcon } from "@/components/ui/ClientIcon";
import {
  adminBulkPreviewLiveCallsAction,
  adminBulkConfirmCreateLiveCallsAction,
  type BulkPreviewRow,
  type BulkUploadResult,
} from "@/actions/adminlivecall.actions";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

type Stage = "upload" | "review" | "done";

function PinBadge({ value }: { value: string }) {
  if (!value) return <span className="text-slate-300 dark:text-slate-600">—</span>;
  return (
    <span className="inline-block font-mono font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded px-1.5 py-0.5 text-[11px]">
      {value}
    </span>
  );
}

export function BulkUploadLiveCallsModal({ onClose, onCreated }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("upload");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [rows, setRows] = useState<BulkPreviewRow[]>([]);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const pickFile = (f: File | null) => setFile(f);

  const preview = async () => {
    if (!file) return;
    setIsPreviewing(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await adminBulkPreviewLiveCallsAction(formData);
      if (!res.success || !res.data) {
        toast.error((res.success ? undefined : res.error) || "Couldn't read this file");
        return;
      }
      if (res.data.rows.length === 0) {
        toast.error("No rows found in this file");
        return;
      }
      setRows(res.data.rows);
      setStage("review");
    } finally {
      setIsPreviewing(false);
    }
  };

  const confirmCreate = async () => {
    if (validRows.length === 0) return;
    setIsCreating(true);
    try {
      const res = await adminBulkConfirmCreateLiveCallsAction(validRows);
      if (!res.success || !res.data) {
        toast.error((res.success ? undefined : res.error) || "Failed to create these orders");
        return;
      }
      setResult(res.data);
      setStage("done");
      if (res.data.createdCount > 0) {
        toast.success(`${res.data.createdCount} call${res.data.createdCount === 1 ? "" : "s"} created`);
        onCreated();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const startOver = () => {
    setFile(null);
    setRows([]);
    setResult(null);
    setStage("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const footer =
    stage === "upload" ? (
      <button
        type="button"
        onClick={preview}
        disabled={isPreviewing || !file}
        className="w-full h-12 sm:h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
      >
        {isPreviewing ? (
          "Reading file..."
        ) : (
          <>
            <ClientIcon icon="ph:eye-bold" className="w-4 h-4" /> Preview
          </>
        )}
      </button>
    ) : stage === "review" ? (
      <div className="flex gap-2.5 w-full">
        <button
          type="button"
          onClick={startOver}
          className="h-12 sm:h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold cursor-pointer hover:border-slate-300 transition-colors shrink-0"
        >
          Back
        </button>
        <button
          type="button"
          onClick={confirmCreate}
          disabled={isCreating || validRows.length === 0}
          className="flex-1 h-12 sm:h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          {isCreating ? (
            "Creating..."
          ) : (
            <>
              <ClientIcon icon="ph:check-circle-bold" className="w-4 h-4" /> Create {validRows.length} Call
              {validRows.length === 1 ? "" : "s"}
            </>
          )}
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={onClose}
        className="w-full h-12 sm:h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold cursor-pointer transition-colors"
      >
        Done
      </button>
    );

  return (
    <Modal
      title={stage === "review" ? `Review ${rows.length} Row${rows.length === 1 ? "" : "s"}` : "Bulk Upload Live Calls"}
      onClose={onClose}
      maxWidthClass={stage === "review" ? "sm:max-w-5xl" : "sm:max-w-xl"}
      bodyClassName={stage === "review" ? "p-0" : "p-4"}
      footer={footer}
    >
      {stage === "upload" && (
        <div className="flex flex-col gap-4">
          <a
            href="/api/admin/live-calls/sample-template"
            className="w-full h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-blue-400 transition-colors"
          >
            <ClientIcon icon="ph:download-simple-bold" className="w-4 h-4" /> Download Sample Template
          </a>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) pickFile(dropped);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-[#00B4FF] bg-[#00B4FF]/5"
                : file
                  ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5"
                  : "border-slate-300 dark:border-slate-700 hover:border-[#00B4FF]"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center ${
                file ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              <ClientIcon icon={file ? "ph:file-xls-fill" : "ph:cloud-arrow-up-bold"} className="w-5 h-5" />
            </div>
            {file ? (
              <>
                <p className="text-sm font-bold text-slate-900 dark:text-white break-all">{file.name}</p>
                <p className="text-[11px] text-slate-400">Tap to choose a different file</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Drop a file here, or tap to browse</p>
                <p className="text-[11px] text-slate-400">.xlsx or .csv</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>

          <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
            <ClientIcon icon="ph:info-bold" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            One row = one call. Package Name must exactly match a package already in the system. Leave the vendor
            email blank to broadcast a call for any matching vendor to buy, or fill it in to assign that call
            directly and free of charge. Up to 500 rows per upload. Job PINs are generated automatically — you&apos;ll
            review everything, including the PINs, before anything is created.
          </p>
        </div>
      )}

      {stage === "review" && (
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2.5 py-1 flex items-center gap-1">
              <ClientIcon icon="ph:check-circle-bold" className="w-3.5 h-3.5" /> {validRows.length} ready
            </span>
            {invalidRows.length > 0 && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-full px-2.5 py-1 flex items-center gap-1">
                <ClientIcon icon="ph:warning-circle-bold" className="w-3.5 h-3.5" /> {invalidRows.length} need fixing
              </span>
            )}
          </div>

          {/* Desktop: scrollable table */}
          <div className="hidden sm:block overflow-x-auto max-h-[55vh] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-[#0F172A] z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-3 py-2.5">Row</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5">Package</th>
                  <th className="px-3 py-2.5">Vendor</th>
                  <th className="px-3 py-2.5">Start PIN</th>
                  <th className="px-3 py-2.5">Complete PIN</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.rowNumber}
                    className={`text-xs border-b border-slate-50 dark:border-slate-800/60 ${!r.valid ? "bg-rose-50/50 dark:bg-rose-500/5" : ""}`}
                  >
                    <td className="px-3 py-2.5 font-bold text-slate-400">{r.rowNumber}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{r.customerName || "—"}</p>
                      <p className="text-slate-400">{r.customerPhone || "—"}</p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 max-w-[180px] truncate" title={`${r.address}, ${r.city}`}>
                      {r.city || "—"} {r.pincode}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-slate-700 dark:text-slate-300">{r.packageName || "—"}</p>
                      {r.estimatedSubtotal !== null && <p className="text-slate-400">×{r.quantity} — ₹{r.estimatedSubtotal}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{r.vendorName ?? "Broadcast"}</td>
                    <td className="px-3 py-2.5">
                      <PinBadge value={r.startPin} />
                    </td>
                    <td className="px-3 py-2.5">
                      <PinBadge value={r.completionPin} />
                    </td>
                    <td className="px-3 py-2.5">
                      {r.valid ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <ClientIcon icon="ph:check-bold" className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold" title={r.error ?? ""}>
                          {r.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="sm:hidden flex flex-col gap-2.5 p-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {rows.map((r) => (
              <div
                key={r.rowNumber}
                className={`rounded-xl border p-3 flex flex-col gap-2 ${
                  r.valid ? "border-slate-200 dark:border-slate-700/80" : "border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Row {r.rowNumber}</span>
                  {r.valid ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ClientIcon icon="ph:check-circle-bold" className="w-3.5 h-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <ClientIcon icon="ph:warning-circle-bold" className="w-3.5 h-3.5" /> Error
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{r.customerName || "—"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {r.customerPhone || "—"} · {r.city || "—"} {r.pincode}
                </p>
                {r.valid ? (
                  <>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {r.packageName} ×{r.quantity}
                      {r.estimatedSubtotal !== null ? ` — ₹${r.estimatedSubtotal}` : ""}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.vendorName ?? "Broadcast to all matching vendors"}</p>
                    <div className="flex items-center gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Start</span>
                        <PinBadge value={r.startPin} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Complete</span>
                        <PinBadge value={r.completionPin} />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{r.error}</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 flex items-start gap-1.5 px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800">
            <ClientIcon icon="ph:info-bold" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Only the {validRows.length} ready row{validRows.length === 1 ? "" : "s"} will be created. Fix the file and re-upload to include the rest.
          </p>
        </div>
      )}

      {stage === "done" && result && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center text-center gap-2 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ClientIcon icon="ph:check-bold" className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {result.createdCount} call{result.createdCount === 1 ? "" : "s"} created
            </p>
          </div>
          {result.failures.length > 0 && (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {result.failures.length} row{result.failures.length === 1 ? "" : "s"} failed at creation:
              </p>
              {result.failures.map((f, i) => (
                <p key={i} className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-2.5 py-1.5">
                  Row {f.rowNumber}: {f.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
