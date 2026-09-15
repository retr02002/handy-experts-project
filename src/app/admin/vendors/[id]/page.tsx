import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { TabDef } from "@/components/shared/TabShell";
import {
  getAdminVendorByIdAction,
  getVendorPerformanceAction,
  getVendorCategoriesAction,
} from "@/actions/admin.actions";
import { getAdminVendorWalletAction } from "@/actions/wallet.actions";
import { getReviewsForVendorByIdAction } from "@/actions/review.actions";
import { getCategoriesWithServiceOptionsAction } from "@/actions/category.actions";
import { getVendorServiceAreasForAdminAction } from "@/actions/vendorservicearea.actions";
import { getServiceCallsForVendorAction } from "@/actions/servicecall.actions";
import { VendorDetailTabs } from "@/components/admin/vendor-detail/VendorDetailTabs";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [vendorRes, walletRes, performanceRes, reviewsRes, categoriesRes, assignedRes, areasRes, ordersRes] =
    await Promise.all([
      getAdminVendorByIdAction(id),
      getAdminVendorWalletAction(id),
      getVendorPerformanceAction(id),
      getReviewsForVendorByIdAction(id),
      getCategoriesWithServiceOptionsAction(),
      getVendorCategoriesAction(id),
      getVendorServiceAreasForAdminAction(id),
      getServiceCallsForVendorAction(id),
    ]);

  if (!vendorRes.success || !vendorRes.data) notFound();
  const vendor = vendorRes.data;
  const performance = performanceRes.success ? performanceRes.data ?? null : null;

  const wallet = walletRes.success ? walletRes.data ?? null : null;
  const statChips = [
    { label: "Technicians", value: String(vendor.technicianCount), icon: "ph:users-three-fill" },
    { label: "Service Calls", value: String(vendor.serviceCallCount), icon: "ph:wrench-fill" },
    { label: "Wallet Balance", value: `₹${(wallet?.balance ?? 0).toFixed(0)}`, icon: "ph:wallet-fill" },
  ];

  const header = (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/vendors"
          className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#00B4FF] to-blue-600 text-white flex items-center justify-center text-lg sm:text-xl font-black shrink-0">
            {vendor.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{vendor.companyName}</h1>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  vendor.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                }`}
              >
                {vendor.isActive ? "Active" : "Deactivated"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {vendor.contactName} · {vendor.phone} · {vendor.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
        {statChips.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 px-2.5 py-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0"
          >
            <ClientIcon icon={s.icon} className="w-4 h-4 text-[#00B4FF] shrink-0" />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">{s.value}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const orders = ordersRes.success ? ordersRes.data ?? [] : [];

  const tabs: Omit<TabDef, "content">[] = [
    { id: "info", label: "Info", icon: "ph:identification-card-bold" },
    { id: "wallet", label: "Wallet", icon: "ph:wallet-bold" },
    { id: "orders", label: "Orders", icon: "ph:receipt-bold", badge: orders.length },
    { id: "technicians", label: "Technicians", icon: "ph:users-three-bold", badge: vendor.technicianCount },
    { id: "reviews", label: "Reviews", icon: "ph:star-bold", badge: reviewsRes.success ? reviewsRes.data?.length : undefined },
    { id: "performance", label: "Performance", icon: "ph:chart-line-up-bold" },
    { id: "coverage", label: "Coverage", icon: "ph:map-pin-area-bold" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <VendorDetailTabs
        header={header}
        tabDefs={tabs}
        vendor={vendor}
        walletData={walletRes.success ? walletRes.data ?? null : null}
        technicians={performance?.technicians ?? []}
        orders={orders}
        reviews={reviewsRes.success ? reviewsRes.data ?? [] : []}
        performance={performance}
        categories={categoriesRes.success ? categoriesRes.data ?? [] : []}
        assignedCategoryIds={assignedRes.success ? (assignedRes.data ?? []).map((c) => c.categoryId) : []}
        areas={areasRes.success ? areasRes.data ?? [] : []}
      />
    </div>
  );
}
