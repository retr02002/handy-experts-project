"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";


interface Props {
  serviceCallId: string;
  ticketNumber?: string;
  audience: "customer" | "vendor" | "admin";
  mode: "view" | "download";
  className?: string;
  label?: React.ReactNode;
}

export function DownloadInvoiceButton({ serviceCallId, ticketNumber, audience, mode, className = "", label }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloading) return;
    
    const url = `/api/service-calls/${serviceCallId}/document?audience=${audience}${mode === "view" ? "&disposition=inline" : ""}`;

    if (mode === "view") {
      window.open(url, "_blank");
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch document");
      const blob = await res.blob();
      const fileName = `Invoice-${ticketNumber || serviceCallId}.pdf`;

      fallbackWebDownload(blob, fileName);
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
      // Fallback to opening in a new tab if fetch fails (e.g., CORS)
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const fallbackWebDownload = (blob: Blob, fileName: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  };

  const isView = mode === "view";
  const icon = isView ? "ph:eye-bold" : "ph:download-simple-bold";

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      title={isView ? "View invoice" : "Download invoice"}
      className={`${className} ${downloading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <ClientIcon icon={downloading ? "ph:spinner-gap-bold" : icon} className={downloading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
      {downloading ? "Loading..." : label}
    </button>
  );
}
