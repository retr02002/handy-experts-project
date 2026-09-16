"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { KycDocumentRow } from "@/components/shared/kyc/KycDocumentRow";
import { OtherDocumentsSection } from "@/components/shared/kyc/OtherDocumentsSection";
import { TechnicianSignatureModal } from "@/components/technician/TechnicianSignatureModal";
import { TECHNICIAN_KYC_FIELDS } from "@/lib/kycDocumentTypes";
import { deleteKycDocumentAction, type KycDocSummary } from "@/actions/kyc.actions";

export function TechnicianDocumentsTab({ initialDocuments }: { initialDocuments: KycDocSummary[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [signing, setSigning] = useState(false);
  const { update } = useSession();

  const byType = (type: string) => documents.find((d) => d.documentType === type) ?? null;
  const others = documents.filter((d) => d.documentType === "OTHER");

  const upsert = (doc: KycDocSummary) => {
    setDocuments((prev) => {
      const withoutOld = doc.documentType === "OTHER" ? prev : prev.filter((d) => d.documentType !== doc.documentType);
      return [doc, ...withoutOld];
    });
    // Keeps the navbar avatar in sync with a freshly uploaded photo without
    // requiring a logout/login — see the jwt callback's "update" trigger.
    if (doc.documentType === "PHOTO") void update();
  };

  const remove = async (id: string) => {
    const wasPhoto = documents.find((d) => d.id === id)?.documentType === "PHOTO";
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await deleteKycDocumentAction(id);
    if (wasPhoto) void update();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Upload once — vendors and admins can view these, and your Profile Photo is used on your ID card automatically.
      </p>
      {TECHNICIAN_KYC_FIELDS.map((f) => {
        const isSignature = "captureMode" in f && f.captureMode === "draw";
        return (
          <KycDocumentRow
            key={f.type}
            icon={f.icon}
            label={f.label}
            documentType={f.type}
            document={byType(f.type)}
            helperText={f.helperText}
            onChange={upsert}
            onDelete={remove}
            onTriggerCapture={isSignature ? () => setSigning(true) : undefined}
          />
        );
      })}
      <OtherDocumentsSection documents={others} onAdded={upsert} onDeleted={remove} />

      {signing && <TechnicianSignatureModal onClose={() => setSigning(false)} onSaved={upsert} />}
    </div>
  );
}
