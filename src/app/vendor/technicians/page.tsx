"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getMyTechniciansAction, type VendorTechnician } from "@/actions/technician.actions";
import { TechniciansTable } from "@/components/vendor/TechniciansTable";
import { TechniciansCardGrid } from "@/components/vendor/TechniciansCardGrid";
import { CreateTechnicianModal } from "@/components/vendor/CreateTechnicianModal";
import { TechnicianDetailModal } from "@/components/vendor/TechnicianDetailModal";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function VendorTechniciansPage() {
  const [technicians, setTechnicians] = useState<VendorTechnician[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("cards");
  const [detailTech, setDetailTech] = useState<VendorTechnician | null>(null);

  const load = useCallback(async () => {
    const res = await getMyTechniciansAction();
    if (res.success && res.data) setTechnicians(res.data);
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Technicians</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Technicians registered under your company.</p>
        </div>
        <div className="flex items-center gap-3">
          {technicians.length > 0 && <ViewToggle view={view} onChange={setView} />}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
          >
            <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
            Add Technician
          </button>
        </div>
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : technicians.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <ClientIcon icon="ph:users-three" className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No technicians yet</p>
          <p className="text-sm text-slate-400 mb-4">Add your first technician to start assigning live calls.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
          >
            <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
            Add Technician
          </button>
        </div>
      ) : view === "table" ? (
        <TechniciansTable data={technicians} onView={setDetailTech} />
      ) : (
        <TechniciansCardGrid data={technicians} onView={setDetailTech} />
      )}

      {modalOpen && <CreateTechnicianModal onClose={() => setModalOpen(false)} onCreated={load} />}
      {detailTech && (
        <TechnicianDetailModal technician={detailTech} onClose={() => setDetailTech(null)} onChanged={load} />
      )}
    </div>
  );
}
