"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Modal } from "@/components/shared/Modal";
import { TabShell } from "@/components/shared/TabShell";
import { AccountSettingsCard } from "@/components/shared/AccountSettingsCard";
import { TechnicianPhoneCard } from "@/components/technician/TechnicianPhoneCard";
import { TechnicianDocumentsTab } from "@/components/technician/TechnicianDocumentsTab";
import { TechnicianIdCardTab } from "@/components/technician/TechnicianIdCardTab";
import { LogoutMenuItem } from "@/components/shared/LogoutMenuItem";
import type { ProfileDetails } from "@/actions/profile.actions";
import type { KycDocSummary } from "@/actions/kyc.actions";
import type { IdCardPreviewData } from "@/components/technician/IdCardPreview";
import { TECHNICIAN_KYC_FIELDS } from "@/lib/kycDocumentTypes";

function DetailCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <ClientIcon icon={icon} className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

export function TechnicianProfileClient({
  profile,
  documents,
  idCardData,
}: {
  profile: ProfileDetails;
  documents: KycDocSummary[];
  idCardData: IdCardPreviewData | null;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const userName = profile.name || "Technician";
  const technician = profile.technicianProfile;

  const pendingCount = TECHNICIAN_KYC_FIELDS.filter(
    (f) => !documents.some((d) => d.documentType === f.type)
  ).length;

  const header = (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your professional details and account settings.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="absolute -bottom-14 left-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white dark:bg-[#0F172A] p-1.5 shadow-lg">
                <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                  {profile.image ? (
                    <Image src={profile.image} alt={userName} fill className="object-cover" />
                  ) : (
                    <ClientIcon icon="ph:user" className="w-11 h-11 text-slate-400" />
                  )}
                </div>
              </div>
              {technician?.type === "FREELANCE" && (
                <div
                  className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0F172A]"
                  title="Freelance Technician"
                ></div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 pb-6 px-8 flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{userName}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
          {technician?.type === "VENDOR_MANAGED" && (
            <span className="mt-2 w-fit px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
              Managed by a vendor
            </span>
          )}
        </div>

        {/* Quick actions — same 3-tile pattern as the customer profile page:
            History and Ratings are full pages (no bottom-nav slot of their
            own except Ratings), Info opens a modal instead of the old
            always-visible "Professional Details" card below. */}
        <div className="px-4 sm:px-6 pb-5 flex items-center justify-between sm:justify-around border-t border-slate-100 dark:border-slate-800 pt-4">
          <Link href="/technician/history" className="flex flex-col items-center gap-1.5 group w-1/3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
              <ClientIcon icon="ph:clock-counter-clockwise" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">History</span>
          </Link>

          <Link href="/technician/feedback" className="flex flex-col items-center gap-1.5 group w-1/3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
              <ClientIcon icon="ph:star" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">Ratings</span>
          </Link>

          <button type="button" onClick={() => setInfoOpen(true)} className="flex flex-col items-center gap-1.5 group w-1/3 cursor-pointer">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
              <ClientIcon icon="ph:info" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">Info</span>
          </button>
        </div>
      </div>
    </>
  );

  const overviewContent = (
    <div className="flex flex-col gap-6">
      <TechnicianPhoneCard initialPhone={profile.phone} />

      <AccountSettingsCard
        name={userName}
        email={profile.email || ""}
        hasPassword={profile.hasPassword}
        accentClass="text-amber-500"
      />

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <LogoutMenuItem />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <TabShell
        header={header}
        tabs={[
          { id: "overview", label: "Overview", icon: "ph:user", content: overviewContent },
          {
            id: "documents",
            label: "Documents",
            icon: "ph:folder-lock",
            badge: pendingCount > 0 ? pendingCount : undefined,
            content: <TechnicianDocumentsTab initialDocuments={documents} />,
          },
          {
            id: "id-card",
            label: "ID Card",
            icon: "ph:identification-card",
            content: <TechnicianIdCardTab data={idCardData} />,
          },
        ]}
      />

      {infoOpen && technician && (
        <Modal title="Professional Details" onClose={() => setInfoOpen(false)}>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-400 -mt-1 mb-1">
              Verified details from your registration. Contact support to update these.
            </p>
            <DetailCard icon="ph:wrench" label="Primary Skill" value={technician.skillCategory} />
            <DetailCard icon="ph:clock-counter-clockwise" label="Experience" value={`${technician.experienceYears} years`} />
            <DetailCard icon="ph:map-pin" label="Service Area" value={technician.servicePincode ?? "—"} />
            <DetailCard
              icon="ph:identification-card"
              label="Employment Type"
              value={technician.type === "FREELANCE" ? "Freelance" : "Vendor Managed"}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
