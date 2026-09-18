import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { VendorTechnician } from "@/actions/technician.actions";
import { FreelanceSkillManager } from "./FreelanceSkillManager";
import { FreelanceServiceAreaManager } from "./FreelanceServiceAreaManager";
import type { TechnicianServiceAreaSummary } from "@/actions/technicianservicearea.actions";
import { FreelanceLeadFeeManager } from "./FreelanceLeadFeeManager";
import { AdminPasswordReset } from "./AdminPasswordReset";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{value || "—"}</p>
    </div>
  );
}

/** Read-only — the admin has no technician-edit actions today (edits stay a vendor responsibility); this is oversight, not management. */
export function AdminTechnicianInfoTab({
  technician,
  serviceAreas,
}: {
  technician: VendorTechnician;
  serviceAreas?: TechnicianServiceAreaSummary[];
}) {
  const stats = [
    { label: "Jobs completed", value: String(technician.jobsCompleted), icon: "ph:check-circle-fill" },
    { label: "Active jobs", value: String(technician.jobsActive), icon: "ph:wrench-fill" },
    {
      label: technician.ratingCount > 0 ? `Rating (${technician.ratingCount})` : "Rating",
      value: technician.ratingCount > 0 ? (technician.ratingAvg ?? 0).toFixed(1) : "—",
      icon: "ph:star-fill",
    },
    { label: "In service area", value: technician.isWithinServiceArea ? "Yes" : "No", icon: "ph:map-pin-area-fill" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <ClientIcon icon={s.icon} className="w-4 h-4 text-[#00B4FF] mb-1.5" />
            <p className="text-lg font-black text-slate-900 dark:text-white truncate">{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
        <InfoField label="Vendor" value={technician.vendorName ?? "Freelance"} />
        <InfoField label="Skill" value={technician.skillCategory} />
        <InfoField label="Experience" value={`${technician.experienceYears} years`} />
        <InfoField label="Phone" value={technician.phone} />
        <InfoField label="Email" value={technician.email} />
        <InfoField label="Login Username" value={technician.username ?? "Not set"} />
        <InfoField label="Type" value={technician.type} />
        <InfoField label="Service Area Pincode" value={technician.servicePincode ?? "Not set"} />
        <InfoField label="On the platform since" value={new Date(technician.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
      </div>

      {technician.type === "FREELANCE" ? (
        <div className="flex flex-col gap-4">
          <FreelanceLeadFeeManager technicianId={technician.id} initialType={technician.leadFeeType} initialAmount={technician.leadFeeAmount} />
          <AdminPasswordReset technicianId={technician.id} />
          <div className="flex flex-col xl:flex-row gap-4 items-start">
            <div className="w-full xl:flex-1">
              <FreelanceSkillManager technician={technician} />
            </div>
            <div className="w-full xl:w-[480px]">
              {serviceAreas && <FreelanceServiceAreaManager technicianId={technician.id} initialAreas={serviceAreas} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">What they do</p>
          {technician.skillAssignments.length === 0 ? (
            <p className="text-sm text-slate-400">Not assigned yet — this technician won&apos;t see any jobs.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {technician.skillAssignments.map((a) => (
                <p key={a.categoryId} className="text-sm font-semibold text-slate-900 dark:text-white">
                  {a.categoryName}
                  {a.serviceIds.length > 0 && (
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {" "}
                      ({a.serviceIds.length} service{a.serviceIds.length === 1 ? "" : "s"})
                    </span>
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
