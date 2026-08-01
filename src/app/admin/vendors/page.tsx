"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getAllVendorsForAdminAction, type AdminVendor } from "@/actions/admin.actions";
import { VendorsTable } from "@/components/admin/VendorsTable";
import { VendorsCardGrid } from "@/components/admin/VendorsCardGrid";
import { CreateVendorModal } from "@/components/admin/CreateVendorModal";
import { VendorDetailModal } from "@/components/admin/VendorDetailModal";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("cards");
  const [detailVendor, setDetailVendor] = useState<AdminVendor | null>(null);

  const load = useCallback(async () => {
    const res = await getAllVendorsForAdminAction();
    if (res.success && res.data) setVendors(res.data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendors & Companies</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Every vendor registered on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          {vendors.length > 0 && <ViewToggle view={view} onChange={setView} />}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
          >
            <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
            Add Vendor
          </button>
        </div>
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : vendors.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <ClientIcon icon="ph:buildings" className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No vendors yet</p>
          <p className="text-sm text-slate-400 mb-4">Add your first vendor or wait for self-signups.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
          >
            <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
            Add Vendor
          </button>
        </div>
      ) : view === "table" ? (
        <VendorsTable data={vendors} onView={setDetailVendor} />
      ) : (
        <VendorsCardGrid data={vendors} onView={setDetailVendor} />
      )}

      {modalOpen && <CreateVendorModal onClose={() => setModalOpen(false)} onCreated={load} />}
      {detailVendor && (
        <VendorDetailModal vendor={detailVendor} onClose={() => setDetailVendor(null)} onChanged={load} />
      )}
    </div>
  );
}
