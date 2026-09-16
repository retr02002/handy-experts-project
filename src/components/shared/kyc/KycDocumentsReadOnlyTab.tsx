import React from "react";
import { KycDocumentRow } from "./KycDocumentRow";
import { OtherDocumentsSection } from "./OtherDocumentsSection";
import type { KycDocSummary } from "@/actions/kyc.actions";

interface Field {
  type: string;
  label: string;
  icon: string;
}

interface Props {
  documents: KycDocSummary[];
  fields: readonly Field[];
  /** Vendor logo — pass only for a vendor owner; undefined hides the row entirely. */
  logoUrl?: string | null;
}

/**
 * Read-only Documents tab for admin/vendor detail pages — same rows as the
 * owner's own editable view, with every upload/replace/remove control
 * omitted. Data is fetched server-side by the page above (matching how
 * every other TabShell tab on this project works) and passed in already
 * resolved, so switching to this tab fires no network request.
 */
export function KycDocumentsReadOnlyTab({ documents, fields, logoUrl }: Props) {
  const byType = (type: string) => documents.find((d) => d.documentType === type) ?? null;
  const others = documents.filter((d) => d.documentType === "OTHER");

  return (
    <div className="flex flex-col gap-3">
      {logoUrl !== undefined && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-full h-full object-contain" />
            ) : (
              <span className="text-[9px] text-slate-400 text-center px-1">No logo</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Company Logo</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Used on this vendor&apos;s invoices and ID cards.</p>
          </div>
        </div>
      )}

      {fields.map((f) => (
        <KycDocumentRow key={f.type} icon={f.icon} label={f.label} documentType={f.type} document={byType(f.type)} readOnly />
      ))}

      <OtherDocumentsSection documents={others} readOnly />
    </div>
  );
}
