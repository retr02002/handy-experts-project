import React from "react";
import { Service, ServicePackage } from "@/types/service";
import { ServicesPageServiceCard } from "@/components/ui/ServicesPageServiceCard";
import { PackageCard } from "@/components/ui/PackageCard";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface ServicesListProps {
  services: Service[];
  viewType: "services" | "packages";
}

export function ServicesList({ services, viewType }: ServicesListProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <ClientIcon icon="ph:magnifying-glass-duotone" className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          We couldn&apos;t find any {viewType} matching your current filters. Try adjusting your search or clearing the filters.
        </p>
      </div>
    );
  }

  if (viewType === "packages") {
    // Flatten all packages from filtered services
    const allPackages: { parentService: Service; pkg: ServicePackage }[] = [];
    services.forEach((service) => {
      service.packages.forEach((pkg) => {
        allPackages.push({ parentService: service, pkg });
      });
    });

    if (allPackages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No packages available</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            The selected services do not have any specific packages listed at the moment.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {allPackages.map((item, idx) => (
          <PackageCard
            key={`${item.parentService.id}-${item.pkg.name}-${idx}`}
            parentService={item.parentService}
            pkg={item.pkg}
          />
        ))}
      </div>
    );
  }

  // viewType === "services"
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {services.map((service) => (
        <ServicesPageServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
