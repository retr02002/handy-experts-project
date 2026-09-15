"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { CreateLiveCallModal } from "./CreateLiveCallModal";
import { BulkUploadLiveCallsModal } from "./BulkUploadLiveCallsModal";

// New rows land within the panel's own existing 15s poll — no explicit
// refetch wiring needed between this and AdminLiveCallsPanel.
export function AdminLiveCallsHeaderActions() {
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setBulkOpen(true)}
          className="h-10 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center gap-2 cursor-pointer hover:border-blue-400 transition-colors"
        >
          <ClientIcon icon="ph:upload-simple-bold" className="w-4 h-4" /> Bulk Upload
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ClientIcon icon="ph:plus-bold" className="w-4 h-4" /> Create Live Call
        </button>
      </div>

      {createOpen && <CreateLiveCallModal onClose={() => setCreateOpen(false)} onCreated={() => {}} />}
      {bulkOpen && <BulkUploadLiveCallsModal onClose={() => setBulkOpen(false)} onCreated={() => {}} />}
    </>
  );
}
