"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { KycDocumentRow } from "@/components/shared/kyc/KycDocumentRow";
import { OtherDocumentsSection } from "@/components/shared/kyc/OtherDocumentsSection";
import { VENDOR_KYC_FIELDS } from "@/lib/kycDocumentTypes";
import { deleteKycDocumentAction, type KycDocSummary } from "@/actions/kyc.actions";
import type { PlatformDocumentSummary } from "@/actions/platformDocument.actions";

interface Props {
  initialDocuments: KycDocSummary[];
  agreementTemplate: PlatformDocumentSummary | null;
}

export function VendorDocumentsSection({ initialDocuments, agreementTemplate }: Props) {
  const [documents, setDocuments] = useState(initialDocuments);

  const byType = (type: string) => documents.find((d) => d.documentType === type) ?? null;
  const others = documents.filter((d) => d.documentType === "OTHER");

  const upsert = (doc: KycDocSummary) => {
    setDocuments((prev) => {
      const withoutOld = doc.documentType === "OTHER" ? prev : prev.filter((d) => d.documentType !== doc.documentType);
      return [doc, ...withoutOld];
    });
  };

  const remove = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await deleteKycDocumentAction(id);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <ClientIcon icon="ph:folder-lock" className="text-blue-500 w-5 h-5" />
        Documents
      </h2>
      <p className="text-xs text-slate-400 mb-5">
        Upload your GST, Aadhaar and PAN for verification — admins can view these on your account.
      </p>

      <div className="mb-4 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ClientIcon icon="ph:file-arrow-down" className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Vendor Agreement</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download, print and sign it, then upload your signed copy below.
            </p>
          </div>
        </div>
        {agreementTemplate ? (
          <a
            href={agreementTemplate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 sm:h-9 px-3 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity sm:ml-auto"
          >
            Download
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 shrink-0">Not available yet</span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {VENDOR_KYC_FIELDS.map((f) => (
          <KycDocumentRow
            key={f.type}
            icon={f.icon}
            label={f.label}
            documentType={f.type}
            document={byType(f.type)}
            helperText={f.helperText}
            onChange={upsert}
            onDelete={remove}
            captureAttr={"captureAttr" in f ? f.captureAttr : undefined}
          />
        ))}
        <OtherDocumentsSection documents={others} onAdded={upsert} onDeleted={remove} />
      </div>
    </div>
  );
}
