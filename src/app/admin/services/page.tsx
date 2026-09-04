import { prisma } from "@/lib/prisma";
import { ServicesManager } from "@/components/admin/services/ServicesManager";

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      include: { packages: { orderBy: { createdAt: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    // Inactive ones are included on purpose: a service already assigned to a
    // paused category must still show its own value in the picker.
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return <ServicesManager services={services} categories={categories} />;
}
