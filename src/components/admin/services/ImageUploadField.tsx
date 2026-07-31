"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
};

export function ImageUploadField({ label, value, onChange, error }: Props) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>

      <div className="flex gap-2 mb-1">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mode === "upload"
              ? "bg-slate-900 text-white dark:bg-blue-600"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mode === "link"
              ? "bg-slate-900 text-white dark:bg-blue-600"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Image Link
        </button>
      </div>

      {mode === "upload" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileSelected}
          />
          <ClientIcon icon={isUploading ? "svg-spinners:180-ring" : "ph:upload-simple-bold"} className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {isUploading ? "Uploading..." : "Click to choose an image (JPG, PNG, WEBP, GIF — max 5MB)"}
          </span>
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {error && <span className="text-xs font-medium text-red-500">{error}</span>}

      {value && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
        </div>
      )}
    </div>
  );
}
