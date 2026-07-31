import React from "react";
import { Service, ServicePackage } from "@/types/service";
import { ServiceBreadcrumb } from "./ServiceBreadcrumb";
import { ServiceSummaryCard } from "./ServiceSummaryCard";
import { MobileCategoryChipBar, DesktopCategorySelectorCard } from "./ServiceCategorySelector";
import { ServiceVideoBanner } from "./ServiceVideoBanner";
import { ServicePackageCard } from "./ServicePackageCard";
import { ServiceCartCard } from "./ServiceCartCard";
import { ServicePromiseCard } from "./ServicePromiseCard";
import { ServiceNeedHelpCard } from "./ServiceNeedHelpCard";
import { ServicePromoBanner } from "./ServicePromoBanner";
import { ServiceBenefitsSection } from "./ServiceBenefitsSection";
import { ServiceProcessSection } from "./ServiceProcessSection";
import { ServiceFaqsSection } from "./ServiceFaqsSection";
import { ServiceMobileCartPopup } from "./ServiceMobileCartPopup";

export function ServiceDetailClient({ service }: { service: Service }) {
  // Group packages by category for UC app-like split navigation
  const packageCategories: Record<string, ServicePackage[]> = {};
  service.packages.forEach((pkg) => {
    const cat = pkg.category || "Recommended Options";
    if (!packageCategories[cat]) packageCategories[cat] = [];
    packageCategories[cat].push(pkg);
  });

  const categoryNames = Object.keys(packageCategories);

  return (
    <div className="bg-slate-50/90 dark:bg-[#060B15] min-h-screen pt-3 sm:pt-6 pb-36 lg:pb-24 text-slate-800 dark:text-slate-100 overflow-x-hidden lg:overflow-visible w-full max-w-full">
      {/* Top Breadcrumb & Back Strip (Server Component) */}
      <ServiceBreadcrumb service={service} />

      {/* Mobile Category Chip Bar (Client Component < lg only) */}
      <MobileCategoryChipBar categoryNames={categoryNames} />

      {/* Urban Company 3-Column Split Architecture */}
      <div className="max-w-[1320px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full relative">

          {/* LEFT COLUMN: Service Summary & Category Selector */}
          <div className="w-full lg:w-[27%] lg:sticky lg:top-24 shrink-0 flex flex-col gap-4 min-w-0 z-20">
            <ServiceSummaryCard service={service} />
            <DesktopCategorySelectorCard categoryNames={categoryNames} packageCategories={packageCategories} />
          </div>

          {/* MIDDLE COLUMN: Video Banner, Package Groups & Details */}
          <div className="w-full lg:w-[45%] flex-1 flex flex-col gap-8 sm:gap-10 min-w-0">

            {/* Video Demonstration Banner & Modal Trigger */}
            <ServiceVideoBanner service={service} />

            {/* Packages List */}
            {categoryNames.map((category, catIdx) => {
              const pkgs = packageCategories[category];
              return (
                <section key={category} id={`section-${category}`} className="scroll-mt-28 sm:scroll-mt-32 flex flex-col gap-3.5 sm:gap-4 min-w-0 w-full">
                  <div className="flex items-center justify-between border-b border-slate-200/90 dark:border-slate-800/80 pb-2 sm:pb-3 px-1">
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate pr-2 flex items-center gap-2">
                      <span>{category}</span>
                    </h2>
                    <span className="text-[11px] sm:text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-[#00B4FF] dark:bg-blue-500/15 dark:text-[#38bdf8] border border-blue-200/50 dark:border-blue-500/20 shrink-0 shadow-2xs">
                      {pkgs.length} option{pkgs.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 sm:gap-5 w-full">
                    {pkgs.map((pkg, idx) => (
                      <ServicePackageCard
                        key={`${category}-${idx}`}
                        service={service}
                        pkg={pkg}
                        idx={idx}
                        catIdx={catIdx}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* In-List Promo Banner */}
            <ServicePromoBanner />

            {/* Why Choose Us Section */}
            <ServiceBenefitsSection service={service} />

            {/* Step-by-Step Process Timeline */}
            <ServiceProcessSection service={service} />

            {/* Frequently Asked Questions */}
            <ServiceFaqsSection service={service} />
          </div>

          {/* RIGHT COLUMN: Responsive Cart (No Height Bounds/Clipping), Promise Guarantee & Assistance */}
          <div className="w-full lg:w-[27%] lg:sticky lg:top-24 shrink-0 flex flex-col gap-4 min-w-0 z-20">
            <ServiceCartCard />
            <ServicePromiseCard />
            <ServiceNeedHelpCard />
          </div>

        </div>
      </div>

      {/* Floating View Cart Strip on Mobile */}
      <ServiceMobileCartPopup />
    </div>
  );
}
