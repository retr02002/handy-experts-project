import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getAllSupportContactsForAdminAction } from "@/actions/supportcontact.actions";
import { SupportContactsManager } from "@/components/admin/SupportContactsManager";

export default async function AdminSupportContactsPage() {
  const res = await getAllSupportContactsForAdminAction();
  const contacts = res.success ? res.data ?? [] : [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/support"
          className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Contacts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Phone numbers and emails vendors can reach you on directly, shown on their Support page as an
            alternative to raising a ticket.
          </p>
        </div>
      </div>

      <SupportContactsManager initialContacts={contacts} />
    </div>
  );
}
