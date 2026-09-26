import { prisma } from "@/lib/prisma";
import { computeLeadPrice } from "@/lib/pricing";

export async function computeLiveCallLeadPrice(
  items: { packageId: string | null; unitPrice: number; quantity: number }[],
  callTotal: number,
  vendorId: string | null,
  vendorDefaultType: string,
  vendorDefaultValue: number
): Promise<number> {
  const packageIds = [...new Set(items.map((i) => i.packageId).filter((id): id is string => !!id))];
  
  if (packageIds.length === 0) {
     return computeLeadPrice(callTotal, vendorDefaultType, vendorDefaultValue);
  }

  const packages = await prisma.servicePackage.findMany({
    where: { id: { in: packageIds } },
    select: {
      id: true,
      leadPricingType: true,
      leadPricingValue: true,
      service: {
        select: {
          id: true,
          leadPricingType: true,
          leadPricingValue: true,
          category: {
            select: {
              id: true,
              leadPricingType: true,
              leadPricingValue: true,
            }
          }
        }
      }
    }
  });

  const packageMap = new Map(packages.map((p) => [p.id, p]));
  const serviceIds = [...new Set(packages.map((p) => p.service.id))];
  const categoryIds = [...new Set(packages.map((p) => p.service.category?.id).filter((id): id is string => !!id))];

  let vPkgMap = new Map();
  let vSvcMap = new Map();
  let vCatMap = new Map();

  if (vendorId) {
    const [vendorPackages, vendorServices, vendorCategories] = await Promise.all([
      prisma.vendorPackage.findMany({ where: { vendorId, packageId: { in: packageIds } } }),
      prisma.vendorService.findMany({ where: { vendorId, serviceId: { in: serviceIds } } }),
      prisma.vendorCategory.findMany({ where: { vendorId, categoryId: { in: categoryIds } } })
    ]);

    vPkgMap = new Map(vendorPackages.map((v) => [v.packageId, v]));
    vSvcMap = new Map(vendorServices.map((v) => [v.serviceId, v]));
    vCatMap = new Map(vendorCategories.map((v) => [v.categoryId, v]));
  }

  let totalLeadPrice = 0;

  for (const item of items) {
    if (!item.packageId) continue;
    const pkg = packageMap.get(item.packageId);
    if (!pkg) continue;

    const svc = pkg.service;
    const cat = svc.category;
    
    let pType = vendorDefaultType;
    let pVal = vendorDefaultValue;

    const vPkg = vPkgMap.get(pkg.id);
    if (vPkg && vPkg.leadPricingType && vPkg.leadPricingValue !== null) {
      pType = vPkg.leadPricingType; pVal = vPkg.leadPricingValue;
    } 
    else if (pkg.leadPricingType && pkg.leadPricingValue !== null) {
      pType = pkg.leadPricingType; pVal = pkg.leadPricingValue;
    }
    else {
      const vSvc = vSvcMap.get(svc.id);
      if (vSvc && vSvc.leadPricingType && vSvc.leadPricingValue !== null) {
        pType = vSvc.leadPricingType; pVal = vSvc.leadPricingValue;
      }
      else if (svc.leadPricingType && svc.leadPricingValue !== null) {
        pType = svc.leadPricingType; pVal = svc.leadPricingValue;
      }
      else if (cat) {
        const vCat = vCatMap.get(cat.id);
        if (vCat && vCat.leadPricingType && vCat.leadPricingValue !== null) {
          pType = vCat.leadPricingType; pVal = vCat.leadPricingValue;
        }
        else if (cat.leadPricingType && cat.leadPricingValue !== null) {
          pType = cat.leadPricingType; pVal = cat.leadPricingValue;
        }
      }
    }

    const itemTotal = item.unitPrice * item.quantity;
    totalLeadPrice += computeLeadPrice(itemTotal, pType, pVal);
  }

  return Math.round(totalLeadPrice);
}
