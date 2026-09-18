"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateFreelanceTechnicianSkillsAction } from "@/actions/freelance.actions";
import { SkillAssignmentBuilder } from "@/components/shared/SkillAssignmentBuilder";
import type { SkillAssignmentInput } from "@/lib/validations/technician.schema";
import type { VendorTechnician } from "@/actions/technician.actions";

export function FreelanceSkillManager({ technician }: { technician: VendorTechnician }) {
  const [isEditing, setIsEditing] = useState(false);
  const [skillAssignments, setSkillAssignments] = useState<SkillAssignmentInput[]>(
    technician.skillAssignments.map((sa) => ({ categoryId: sa.categoryId, serviceIds: sa.serviceIds }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await updateFreelanceTechnicianSkillsAction(technician.id, skillAssignments);
      if (res.success) {
        toast.success("Skills updated successfully");
        setIsEditing(false);
      } else {
        toast.error(res.error || "Failed to update skills");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 relative">
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 text-xs font-bold text-[#00B4FF] hover:text-[#0096fa] transition-colors"
        >
          Edit Skills
        </button>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Skills</p>
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
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Edit Skills</p>
        <button
          onClick={() => {
            setSkillAssignments(technician.skillAssignments.map((sa) => ({ categoryId: sa.categoryId, serviceIds: sa.serviceIds })));
            setIsEditing(false);
          }}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
      <SkillAssignmentBuilder value={skillAssignments} onChange={setSkillAssignments} />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="h-9 px-4 rounded-lg bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold transition-colors disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Save Skills"}
        </button>
      </div>
    </div>
  );
}
