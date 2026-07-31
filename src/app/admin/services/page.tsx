import { prisma } from "@/lib/prisma";
import { ServicesManager } from "@/components/admin/services/ServicesManager";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    include: { packages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return <ServicesManager services={services} />;
}
