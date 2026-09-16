"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TabShell, type TabDef } from "@/components/shared/TabShell";
import type { AdminVendor, VendorPerformance } from "@/actions/admin.actions";
import type { WalletSummary } from "@/actions/wallet.actions";
import type { ReviewItem } from "@/actions/review.actions";
import type { AdminServiceCallSummary } from "@/actions/servicecall.actions";
import type { CategoryWithServiceOptions } from "@/actions/category.actions";
import type { VendorServiceAreaSummary } from "@/actions/vendorservicearea.actions";
import { VendorInfoTab } from "./VendorInfoTab";
import { VendorWalletTab } from "./VendorWalletTab";
import { VendorTechniciansTab } from "./VendorTechniciansTab";
import { VendorOrdersTab } from "./VendorOrdersTab";
import { VendorReviewsTab } from "./VendorReviewsTab";
import { VendorPerformanceTab } from "./VendorPerformanceTab";
import { VendorCoverageTab } from "./VendorCoverageTab";
import { KycDocumentsReadOnlyTab } from "@/components/shared/kyc/KycDocumentsReadOnlyTab";
import { VENDOR_KYC_FIELDS } from "@/lib/kycDocumentTypes";
import type { KycDocSummary } from "@/actions/kyc.actions";

interface Props {
  header: React.ReactNode;
  tabDefs: Omit<TabDef, "content">[];
  vendor: AdminVendor;
  walletData: WalletSummary | null;
  technicians: VendorPerformance["technicians"];
  orders: AdminServiceCallSummary[];
  reviews: ReviewItem[];
  performance: VendorPerformance | null;
  categories: CategoryWithServiceOptions[];
  assignedCategoryIds: string[];
  areas: VendorServiceAreaSummary[];
  documents: KycDocSummary[];
  logoUrl: string | null;
}

/**
 * Thin client shell that turns the server page's pre-fetched props into
 * TabShell panels — kept separate from page.tsx (a server component) since
 * the vendor-active toggle and "refetch after an edit" both need client
 * state / router access.
 */
export function VendorDetailTabs({
  header,
  tabDefs,
  vendor,
  walletData,
  technicians,
  orders,
  reviews,
  performance,
  categories,
  assignedCategoryIds,
  areas,
  documents,
  logoUrl,
}: Props) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(vendor.isActive);
  const onChanged = () => router.refresh();

  const tabs: TabDef[] = tabDefs.map((t) => {
    switch (t.id) {
      case "info":
        return { ...t, content: <VendorInfoTab vendor={vendor} isActive={isActive} onActiveChanged={setIsActive} onChanged={onChanged} /> };
      case "wallet":
        return {
          ...t,
          content: walletData ? (
            <VendorWalletTab vendorId={vendor.id} companyName={vendor.companyName} wallet={walletData} onChanged={onChanged} />
          ) : (
            <p className="text-sm text-slate-400">Wallet unavailable.</p>
          ),
        };
      case "technicians":
        return { ...t, content: <VendorTechniciansTab technicians={technicians} /> };
      case "orders":
        return { ...t, content: <VendorOrdersTab orders={orders} /> };
      case "reviews":
        return { ...t, content: <VendorReviewsTab reviews={reviews} /> };
      case "performance":
        return { ...t, content: performance ? <VendorPerformanceTab v={performance} /> : <p className="text-sm text-slate-400">No performance data yet.</p> };
      case "coverage":
        return {
          ...t,
          content: (
            <VendorCoverageTab vendorId={vendor.id} categories={categories} assignedCategoryIds={assignedCategoryIds} areas={areas} />
          ),
        };
      case "documents":
        return { ...t, content: <KycDocumentsReadOnlyTab documents={documents} fields={VENDOR_KYC_FIELDS} logoUrl={logoUrl} /> };
      default:
        return { ...t, content: null };
    }
  });

  return <TabShell tabs={tabs} header={header} />;
}
