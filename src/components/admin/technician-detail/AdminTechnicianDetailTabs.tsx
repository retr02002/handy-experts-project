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
import type { TechnicianServiceAreaSummary } from "@/actions/technicianservicearea.actions";
import type { TechnicianWalletData } from "@/actions/technicianWallet.actions";
import { AdminTechnicianWalletTab } from "./AdminTechnicianWalletTab";

interface Props {
  header: React.ReactNode;
  tabDefs: Omit<TabDef, "content">[];
  technician: VendorTechnician;
  reviews: ReviewItem[];
  documents: KycDocSummary[];
  serviceAreas?: TechnicianServiceAreaSummary[];
  wallet?: TechnicianWalletData;
}

export function AdminTechnicianDetailTabs({ header, tabDefs, technician, reviews, documents, serviceAreas, wallet }: Props) {
  const tabs: TabDef[] = tabDefs.map((t) => {
    switch (t.id) {
      case "info":
        return { ...t, content: <AdminTechnicianInfoTab technician={technician} serviceAreas={serviceAreas} /> };
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
      case "wallet":
        return { ...t, content: <AdminTechnicianWalletTab technicianId={technician.id} wallet={wallet} /> };
      default:
        return { ...t, content: null };
    }
  });

  return <TabShell tabs={tabs} header={header} />;
}
