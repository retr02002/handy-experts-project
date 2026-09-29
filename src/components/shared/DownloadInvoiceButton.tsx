"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

interface Props {
  serviceCallId: string;
  ticketNumber?: string;
  audience: "customer" | "vendor" | "admin";
  mode: "view" | "download";
  className?: string;
  label?: React.ReactNode;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(blob);
  });
};

export function DownloadInvoiceButton({ serviceCallId, ticketNumber, audience, mode, className = "", label }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloading) return;
    
    const url = `/api/service-calls/${serviceCallId}/document?audience=${audience}${mode === "view" ? "&disposition=inline" : ""}`;

    const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

    if (mode === "view") {
      if (isNative) {
        try {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: url });
        } catch {
          window.open(url, "_blank");
        }
      } else {
        window.open(url, "_blank");
      }
      return;
    }

    if (!isNative) {
      // For web / mobile browsers, downloading via fetch->blob->click is often blocked by popup blockers
      // or unsupported by iOS Safari. Opening the URL directly works much better.
      window.open(url, "_blank");
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch document");
      const blob = await res.blob();
      const fileName = `Invoice-${ticketNumber || serviceCallId}.pdf`;

      try {
        const base64Data = await blobToBase64(blob);
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: `Invoice ${ticketNumber || ""}`.trim(),
          url: savedFile.uri,
          dialogTitle: 'Download Invoice',
        });
      } catch (nativeErr) {
        console.warn("Native share failed, falling back:", nativeErr);
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
      window.open(url, "_blank", "noopener,noreferrer");
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
      {downloading ? "Loading..." : label}
    </button>
  );
}
