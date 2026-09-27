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
    
    setDownloading(true);
    try {
      const url = `/api/service-calls/${serviceCallId}/document?audience=${audience}${mode === "view" ? "&disposition=inline" : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch document");
      const blob = await res.blob();
      
      const fileName = `Invoice-${ticketNumber || serviceCallId}.pdf`;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice ${ticketNumber || ""}`.trim(),
          });
          return;
        }
      }
      
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "view") {
        window.open(objectUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
      alert("Could not load the invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
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
      {label}
    </button>
  );
}
