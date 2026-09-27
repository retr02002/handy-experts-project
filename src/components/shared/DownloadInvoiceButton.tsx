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

    // Check whether the native Capacitor plugins are actually reachable.
    // When the WebView loads from a remote server URL (e.g. handyzo.com),
    // isNativePlatform() returns true but the plugin bridge is absent —
    // calling Filesystem/Share in that state throws "plugin not implemented".
    const hasNativePlugins =
      Capacitor.isNativePlatform() &&
      Capacitor.isPluginAvailable("Filesystem") &&
      Capacitor.isPluginAvailable("Share");

    // For non-native "view", open immediately to keep the user gesture token
    // valid — calling window.open AFTER an async fetch causes popup blockers
    // to block it.
    if (!hasNativePlugins && mode === "view") {
      window.open(url, "_blank");
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch document");
      const blob = await res.blob();
      
      const fileName = `Invoice-${ticketNumber || serviceCallId}.pdf`;

      if (hasNativePlugins) {
        const base64Data = await blobToBase64(blob);
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: `Invoice ${ticketNumber || ""}`.trim(),
          url: savedFile.uri,
          dialogTitle: mode === "view" ? 'View Invoice' : 'Download Invoice',
        });
      } else {
        // Web / fallback "download" mode — creating an <a> tag and clicking
        // it doesn't require a strict user gesture token, so it's safe to do
        // after the async fetch.
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      }
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
      alert("Error: " + (err instanceof Error ? err.message : JSON.stringify(err)));
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
