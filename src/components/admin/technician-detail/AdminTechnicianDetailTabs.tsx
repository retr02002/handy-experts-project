"use client";

import React from "react";
import { TabShell, type TabDef } from "@/components/shared/TabShell";
import type { VendorTechnician } from "@/actions/technician.actions";
import type { ReviewItem } from "@/actions/review.actions";
import { AdminTechnicianInfoTab } from "./AdminTechnicianInfoTab";
import { TechnicianReviewsTab } from "@/components/shared/technician-detail/TechnicianReviewsTab";
import { TechnicianTrackingTab } from "@/components/shared/technician-detail/TechnicianTrackingTab";
import { KycDocumentsReadOnlyTab } from "@/components/shared/kyc/KycDocumentsReadOnlyTab";
import { TECHNICIAN_KYC_FIELDS } from "@/lib/kycDocumentTypes";
import type { KycDocSummary } from "@/actions/kyc.actions";

interface Props {
  header: React.ReactNode;
  tabDefs: Omit<TabDef, "content">[];
  technician: VendorTechnician;
  reviews: ReviewItem[];
  documents: KycDocSummary[];
}

export function AdminTechnicianDetailTabs({ header, tabDefs, technician, reviews, documents }: Props) {
  const tabs: TabDef[] = tabDefs.map((t) => {
    switch (t.id) {
      case "info":
        return { ...t, content: <AdminTechnicianInfoTab technician={technician} /> };
      case "reviews":
        return { ...t, content: <TechnicianReviewsTab reviews={reviews} /> };
      case "tracking":
        return {
          ...t,
          content: (
            <TechnicianTrackingTab
              technicianId={technician.id}
              isOnDuty={technician.isOnDuty}
              isStale={technician.isStale}
              locationUpdatedAt={technician.locationUpdatedAt}
            />
          ),
        };
      case "documents":
        return { ...t, content: <KycDocumentsReadOnlyTab documents={documents} fields={TECHNICIAN_KYC_FIELDS} /> };
      default:
        return { ...t, content: null };
    }
  });

  return <TabShell tabs={tabs} header={header} />;
}
