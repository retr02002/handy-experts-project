import React from "react";
import { VendorCoverageManager } from "@/components/admin/VendorCoverageManager";
import type { CategoryWithServiceOptions } from "@/actions/category.actions";
import type { VendorServiceAreaSummary } from "@/actions/vendorservicearea.actions";

export function VendorCoverageTab({
  vendorId,
  categories,
  assignedCategoryIds,
  areas,
}: {
  vendorId: string;
  categories: CategoryWithServiceOptions[];
  assignedCategoryIds: string[];
  areas: VendorServiceAreaSummary[];
}) {
  return (
    <div className="w-full">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        What this vendor is allowed to serve, and where — both admin-managed. The vendor requests changes via a support ticket.
      </p>
      <VendorCoverageManager
        vendorId={vendorId}
        categories={categories}
        initialAssignedCategoryIds={assignedCategoryIds}
        initialAreas={areas}
      />
    </div>
  );
}
