"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";
import { deleteContactQueryAction, type AdminContactQuery } from "@/actions/contactquery.actions";
import { ContactQueriesTable } from "./ContactQueriesTable";
import { ContactQueriesCardGrid } from "./ContactQueriesCardGrid";
import { ContactQueryDetailModal } from "./ContactQueryDetailModal";

export function ContactQueriesManager({ initialQueries }: { initialQueries: AdminContactQuery[] }) {
  const [queries, setQueries] = useState(initialQueries);
  const [view, setView] = useState<ViewMode>("cards");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const detailQuery = queries.find((q) => q.id === detailId) ?? null;

  const patchLocally = (id: string, patch: Partial<AdminContactQuery>) =>
    setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const removeLocally = (id: string) => setQueries((prev) => prev.filter((q) => q.id !== id));

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact query? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await deleteContactQueryAction(id);
      if (!res.success) {
        toast.error(res.error || "Couldn't delete this query");
        return;
      }
      removeLocally(id);
      if (detailId === id) setDetailId(null);
      toast.success("Query deleted");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Queries</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Messages submitted through the public contact page.
          </p>
        </div>
        {queries.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </div>

      {queries.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <ClientIcon icon="ph:chat-circle-text" className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No contact queries yet</p>
          <p className="text-sm text-slate-400">Submissions from the /contact page will show up here.</p>
        </div>
      ) : view === "table" ? (
        <ContactQueriesTable data={queries} onView={(q) => setDetailId(q.id)} onDelete={handleDelete} busyId={busyId} />
      ) : (
        <ContactQueriesCardGrid data={queries} onView={(q) => setDetailId(q.id)} onDelete={handleDelete} busyId={busyId} />
      )}

      {detailQuery && (
        <ContactQueryDetailModal
          query={detailQuery}
          onClose={() => setDetailId(null)}
          onChanged={(patch) => patchLocally(detailQuery.id, patch)}
          onDeleted={() => {
            removeLocally(detailQuery.id);
            setDetailId(null);
          }}
        />
      )}
    </div>
  );
}
