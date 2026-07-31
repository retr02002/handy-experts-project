import { prisma } from "@/lib/prisma";
import { PackagesManager } from "@/components/admin/services/PackagesManager";

type Props = {
  searchParams: Promise<{ serviceId?: string }>;
};

export default async function AdminPackagesPage({ searchParams }: Props) {
  const { serviceId } = await searchParams;

  const [packages, services] = await Promise.all([
    prisma.servicePackage.findMany({
      include: { service: { select: { id: true, title: true, image: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.service.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return <PackagesManager packages={packages} services={services} initialServiceId={serviceId} />;
}
