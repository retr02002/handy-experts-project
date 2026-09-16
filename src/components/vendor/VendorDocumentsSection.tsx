"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { KycDocumentRow } from "@/components/shared/kyc/KycDocumentRow";
import { OtherDocumentsSection } from "@/components/shared/kyc/OtherDocumentsSection";
import { VENDOR_KYC_FIELDS } from "@/lib/kycDocumentTypes";
import { deleteKycDocumentAction, type KycDocSummary } from "@/actions/kyc.actions";

export function VendorDocumentsSection({ initialDocuments }: { initialDocuments: KycDocSummary[] }) {
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
          />
        ))}
        <OtherDocumentsSection documents={others} onAdded={upsert} onDeleted={remove} />
      </div>
    </div>
  );
}
