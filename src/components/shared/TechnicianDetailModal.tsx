"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Modal } from "./Modal";
import { StarRating } from "./StarRating";
import { getTechnicianPublicProfileAction, type TechnicianPublicProfile } from "@/actions/review.actions";

/** Rapido-style "who's coming" card: credentials plus what customers scored them. */
export function TechnicianDetailModal({
  technicianId,
  onClose,
  onCall,
}: {
  technicianId: string;
  onClose: () => void;
  onCall?: () => void;
}) {
  const [profile, setProfile] = useState<TechnicianPublicProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTechnicianPublicProfileAction(technicianId).then((res) => {
      if (res.success && res.data) setProfile(res.data);
      setLoaded(true);
    });
  }, [technicianId]);

  return (
    <Modal title="Technician details" onClose={onClose}>
      {!loaded ? (
        <p className="text-sm text-slate-400 text-center py-10">Loading...</p>
      ) : !profile ? (
        <p className="text-sm text-slate-400 text-center py-10">Couldn&apos;t load these details.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-600 dark:text-slate-300 shrink-0 overflow-hidden relative">
              {profile.image ? (
                <Image src={profile.image} alt={profile.name} fill className="object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{profile.name}</p>
              {profile.ratingCount > 0 ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarRating value={profile.ratingAvg ?? 0} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {(profile.ratingAvg ?? 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">({profile.ratingCount})</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">No ratings yet</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "ph:wrench-fill", label: "Specialises in", value: profile.skillCategory },
              { icon: "ph:medal-fill", label: "Experience", value: `${profile.experienceYears} yrs` },
              { icon: "ph:check-circle-fill", label: "Jobs done", value: String(profile.jobsCompleted) },
            ].map((s) => (
              <div
                key={s.label}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center"
              >
                <ClientIcon icon={s.icon} className="w-4 h-4 text-[#00B4FF] mx-auto mb-1" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {profile.recentReviews.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">What customers said</p>
              <div className="flex flex-col gap-2">
                {profile.recentReviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.customerName}</p>
                      <StarRating value={r.technicianRating} />
                    </div>
                    {r.technicianComment && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 break-words">{r.technicianComment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {onCall && (
            <button
              type="button"
              onClick={onCall}
              className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ClientIcon icon="ph:phone-fill" className="w-4 h-4" /> Call technician
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
