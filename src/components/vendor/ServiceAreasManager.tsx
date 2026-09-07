"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { ConfirmDeleteDialog } from "@/components/admin/services/ConfirmDeleteDialog";
import { ServiceAreaFormModal } from "./ServiceAreaFormModal";
import {
  updateServiceAreaRadiusAction,
  removeServiceAreaAction,
  type VendorServiceAreaSummary,
} from "@/actions/vendorservicearea.actions";

type Props = {
  areas: VendorServiceAreaSummary[];
};

export function ServiceAreasManager({ areas }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<VendorServiceAreaSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [radiusDrafts, setRadiusDrafts] = useState<Record<string, number>>({});

  const draftFor = (area: VendorServiceAreaSummary) => radiusDrafts[area.id] ?? area.radiusKm;

  const handleSaveRadius = async (area: VendorServiceAreaSummary) => {
    const radiusKm = draftFor(area);
    if (radiusKm === area.radiusKm) return;
    setSavingId(area.id);
    try {
      const res = await updateServiceAreaRadiusAction({ id: area.id, radiusKm });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Radius updated");
      router.refresh();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const res = await removeServiceAreaAction(deleting.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Serviceable area removed");
      setDeleting(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-3 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center sm:items-start gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <ClientIcon icon="ph:map-pin-line-duotone" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Serviceable Areas</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg leading-snug">
              Define the regions where you offer services to receive targeted live calls.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="group relative flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0 cursor-pointer overflow-hidden shadow-sm hover:shadow-md dark:shadow-blue-500/10 w-full sm:w-auto"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out" />
          <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
          <span>Add Area</span>
        </button>
      </div>

      {areas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
            <ClientIcon icon="ph:map-pin-area-duotone" className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
          </div>
          <div className="text-center relative z-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No areas defined</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Add your first service area to start receiving live calls from customers in that region.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 relative z-10 flex items-center gap-1 group/btn"
          >
            Add an area <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {areas.map((area, idx) => {
            const draft = draftFor(area);
            const dirty = draft !== area.radiusKm;
            return (
              <div
                key={area.id}
                className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col gap-3 animate-in zoom-in-95 fill-mode-both"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                      <ClientIcon icon="ph:map-pin-area-fill" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-sm text-slate-900 dark:text-white leading-none">{area.pincode}</p>
                        <span className="px-1 py-0.5 rounded bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wide">Live</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        <ClientIcon icon="ph:navigation-arrow-duotone" className="w-3 h-3" />
                        {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleting(area)}
                    aria-label="Remove"
                    title="Remove"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Radius Limit
                    </label>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                      {draft} km
                    </span>
                  </div>
                  
                  <div className="relative pt-1 pb-0.5">
                    <input
                      type="range"
                      min={1}
                      max={25}
                      step={1}
                      value={draft}
                      onChange={(e) => setRadiusDrafts((prev) => ({ ...prev, [area.id]: Number(e.target.value) }))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <div className="flex justify-between mt-1 text-[9px] font-semibold text-slate-400/80">
                      <span>1km</span>
                      <span>25km</span>
                    </div>
                  </div>
                </div>

                {dirty && (
                  <div className="transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => handleSaveRadius(area)}
                      disabled={savingId === area.id}
                      className="w-full h-8 rounded-lg bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {savingId === area.id ? (
                        <><ClientIcon icon="svg-spinners:180-ring" className="w-3.5 h-3.5" /> Saving...</>
                      ) : (
                        <><ClientIcon icon="ph:check-circle-bold" className="w-3.5 h-3.5" /> Apply</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ServiceAreaFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => router.refresh()} />
      )}

      <ConfirmDeleteDialog
        isOpen={Boolean(deleting)}
        title="Remove this serviceable area?"
        description={`Removing "${deleting?.pincode}" stops live calls from being routed to you in that area. This can't be undone.`}
        isDeleting={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
