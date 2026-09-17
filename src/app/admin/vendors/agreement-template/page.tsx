import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getVendorAgreementTemplateAction } from "@/actions/platformDocument.actions";
import { AgreementTemplateCard } from "@/components/admin/AgreementTemplateCard";

export default async function AgreementTemplatePage() {
  const result = await getVendorAgreementTemplateAction();
  const template = result.success ? (result.data ?? null) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/vendors"
          className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agreement Template</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage the vendor agreement every vendor downloads and signs.</p>
        </div>
      </div>

      <AgreementTemplateCard initial={template} />
    </div>
  );
}
