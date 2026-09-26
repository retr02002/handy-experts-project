"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";

export type PricingInputType = "FLAT" | "PERCENTAGE";

export async function setVendorCategoryPricingAction(vendorId: string, categoryId: string, type: PricingInputType | null, value: number | null): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    await prisma.vendorCategory.upsert({
      where: { vendorId_categoryId: { vendorId, categoryId } },
      create: { vendorId, categoryId, leadPricingType: type, leadPricingValue: value },
      update: { leadPricingType: type, leadPricingValue: value },
    });
    revalidatePath(`/admin/vendors/${vendorId}/pricing`);
    return { success: true };
  } catch (err) {
    console.error("Set vendor category pricing error:", err);
    return { success: false, error: "Failed to update category pricing" };
  }
}

export async function setVendorServicePricingAction(vendorId: string, serviceId: string, type: PricingInputType | null, value: number | null): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    await prisma.vendorService.upsert({
      where: { vendorId_serviceId: { vendorId, serviceId } },
      create: { vendorId, serviceId, leadPricingType: type, leadPricingValue: value },
      update: { leadPricingType: type, leadPricingValue: value },
    });
    revalidatePath(`/admin/vendors/${vendorId}/pricing`);
    return { success: true };
  } catch (err) {
    console.error("Set vendor service pricing error:", err);
    return { success: false, error: "Failed to update service pricing" };
  }
}

export async function setVendorPackagePricingAction(vendorId: string, packageId: string, type: PricingInputType | null, value: number | null): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    await prisma.vendorPackage.upsert({
      where: { vendorId_packageId: { vendorId, packageId } },
      create: { vendorId, packageId, leadPricingType: type, leadPricingValue: value },
      update: { leadPricingType: type, leadPricingValue: value },
    });
    revalidatePath(`/admin/vendors/${vendorId}/pricing`);
    return { success: true };
  } catch (err) {
    console.error("Set vendor package pricing error:", err);
    return { success: false, error: "Failed to update package pricing" };
  }
}

export type PricingNode = {
  id: string;
  name: string;
  type: "FLAT" | "PERCENTAGE" | null;
  value: number | null;
  globalType: "FLAT" | "PERCENTAGE" | null;
  globalValue: number | null;
};

export type ServicePricingNode = PricingNode & {
  packages: PricingNode[];
};

export type CategoryPricingNode = PricingNode & {
  services: ServicePricingNode[];
};

export async function getVendorPricingDataAction(vendorId: string): Promise<ActionResponse<CategoryPricingNode[]>> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { leadPricingType: true, leadPricingValue: true }
    });
    const vendorGlobalType = (vendorProfile?.leadPricingType as PricingInputType) ?? "FLAT";
    const vendorGlobalValue = vendorProfile?.leadPricingValue ?? 49;

    // 1. Fetch the raw data
    const [vendorCategories, vendorServices, vendorPackages] = await Promise.all([
      prisma.vendorCategory.findMany({
        where: { vendorId },
        include: { category: { select: { id: true, name: true, leadPricingType: true, leadPricingValue: true } } },
      }),
      prisma.vendorService.findMany({
        where: { vendorId },
        include: { service: { select: { id: true, title: true, categoryId: true, leadPricingType: true, leadPricingValue: true } } },
      }),
      prisma.vendorPackage.findMany({
        where: { vendorId },
      }),
    ]);

    const serviceIds = vendorServices.map((vs) => vs.serviceId);
    
    // Find all involved category IDs
    const categoryIds = new Set<string>();
    vendorCategories.forEach(vc => categoryIds.add(vc.categoryId));
    vendorServices.forEach(vs => { if (vs.service.categoryId) categoryIds.add(vs.service.categoryId); });

    // Fetch the missing category details if they aren't in vendorCategories
    const allInvolvedCategories = await prisma.category.findMany({
      where: { id: { in: Array.from(categoryIds) } },
      select: { id: true, name: true, leadPricingType: true, leadPricingValue: true },
    });

    const allPackages = await prisma.servicePackage.findMany({
      where: { serviceId: { in: serviceIds } },
      select: { id: true, name: true, serviceId: true, leadPricingType: true, leadPricingValue: true },
    });

    const vCatMap = new Map(vendorCategories.map((vc) => [vc.categoryId, vc]));
    const vPkgMap = new Map(vendorPackages.map((vp) => [vp.packageId, vp]));
    const vSvcMap = new Map(vendorServices.map((vs) => [vs.serviceId, vs]));

    const result: CategoryPricingNode[] = allInvolvedCategories.map((cat) => {
      const catGlobalType = (cat.leadPricingType as PricingInputType) ?? vendorGlobalType;
      const catGlobalValue = cat.leadPricingValue ?? vendorGlobalValue;

      // Find services assigned to this category that the vendor is also assigned to
      const myServices = vendorServices.filter((vs) => vs.service.categoryId === cat.id);
      
      const serviceNodes: ServicePricingNode[] = myServices.map((vs) => {
        const svcGlobalType = (vs.service.leadPricingType as PricingInputType) ?? catGlobalType;
        const svcGlobalValue = vs.service.leadPricingValue ?? catGlobalValue;

        // Find packages for this service
        const myPackages = allPackages.filter((p) => p.serviceId === vs.serviceId);
        
        const packageNodes: PricingNode[] = myPackages.map((p) => {
          const vp = vPkgMap.get(p.id);
          const pkgGlobalType = (p.leadPricingType as PricingInputType) ?? svcGlobalType;
          const pkgGlobalValue = p.leadPricingValue ?? svcGlobalValue;

          return {
            id: p.id,
            name: p.name,
            type: vp?.leadPricingType as PricingInputType ?? null,
            value: vp?.leadPricingValue ?? null,
            globalType: pkgGlobalType,
            globalValue: pkgGlobalValue,
          };
        });

        return {
          id: vs.serviceId,
          name: vs.service.title,
          type: vs.leadPricingType as PricingInputType ?? null,
          value: vs.leadPricingValue ?? null,
          globalType: svcGlobalType,
          globalValue: svcGlobalValue,
          packages: packageNodes,
        };
      });

      const vc = vCatMap.get(cat.id);

      return {
        id: cat.id,
        name: cat.name,
        type: vc?.leadPricingType as PricingInputType ?? null,
        value: vc?.leadPricingValue ?? null,
        globalType: catGlobalType,
        globalValue: catGlobalValue,
        services: serviceNodes,
      };
    });

    return { success: true, data: result };
  } catch (err) {
    console.error("Get vendor pricing data error:", err);
    return { success: false, error: "Failed to load pricing data" };
  }
}
