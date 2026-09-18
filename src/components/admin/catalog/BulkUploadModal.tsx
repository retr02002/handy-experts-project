"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { processBulkUploadAction, type BulkUploadType, type BulkUploadResult } from "@/actions/bulkupload.actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: BulkUploadType;
  onSuccess: () => void;
}

export function BulkUploadModal({ isOpen, onClose, type, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.endsWith(".csv") || selected.name.endsWith(".xlsx")) {
        setFile(selected);
        setResult(null);
      } else {
        toast.error("Please select a .csv or .xlsx file");
        e.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await processBulkUploadAction(formData, type);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.errors.length === 0) {
          toast.success(`Successfully processed ${res.data.processed} rows`);
          onSuccess();
        } else {
          toast.warning(`Processed with some errors (${res.data.errors.length})`);
        }
      } else if (!res.success) {
        toast.error(res.error || "Failed to process bulk upload");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const entityName = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Upload {entityName}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-100 dark:border-blue-500/20">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <ClientIcon icon="ph:info-bold" className="w-5 h-5" />
              Step 1: Download Template
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              Download the template to ensure your data is formatted correctly. Instructions are included in the second sheet.
            </p>
            <a
              href={`/api/admin/bulk-upload/template?type=${type}`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ClientIcon icon="ph:download-simple-bold" className="w-4 h-4" />
              Download Template (.xlsx)
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ClientIcon icon="ph:upload-simple-bold" className="w-5 h-5 text-slate-400" />
              Step 2: Upload Data
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Upload your completed template. If the identifying slug already exists, the record will be updated.
            </p>

            <div
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                file ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <ClientIcon
                icon={file ? "ph:file-xls-duotone" : "ph:upload-simple-duotone"}
                className={`w-10 h-10 mb-3 ${file ? "text-emerald-500" : "text-slate-400"}`}
              />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {file ? file.name : "Click to select file"}
              </p>
              <p className="text-xs text-slate-500 mt-1">.csv or .xlsx (max 10MB)</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-xl border ${result.errors.length === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400" : "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-400"}`}>
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <ClientIcon icon={result.errors.length === 0 ? "ph:check-circle-bold" : "ph:warning-circle-bold"} />
                Upload Complete
              </h4>
              <ul className="text-sm space-y-1 mb-3">
                <li>• {result.processed} rows processed</li>
                <li>• {result.created} new records created</li>
                <li>• {result.updated} existing records updated</li>
              </ul>
              
              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-bold mb-2">Errors ({result.errors.length}):</p>
                  <ul className="text-xs space-y-1 max-h-32 overflow-y-auto bg-white/50 dark:bg-black/20 p-2 rounded border border-orange-200/50 dark:border-orange-500/20">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-red-600 dark:text-red-400">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            disabled={isUploading}
          >
            {result ? "Close" : "Cancel"}
          </button>
          {!result && (
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <ClientIcon icon="ph:spinner-bold" className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ClientIcon icon="ph:upload-simple-bold" className="w-4 h-4" />
                  Process File
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
