import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Service, ServiceBenefit, ServiceFaq, ServicePackage, ServiceStep } from "@/types/service";

const serviceWithPackages = Prisma.validator<Prisma.ServiceDefaultArgs>()({
  include: { packages: { orderBy: { createdAt: "asc" } } },
});

type PrismaServiceWithPackages = Prisma.ServiceGetPayload<typeof serviceWithPackages>;
type PrismaServicePackage = PrismaServiceWithPackages["packages"][number];

function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export function mapPrismaPackage(pkg: PrismaServicePackage): ServicePackage {
  return {
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    time: pkg.time ?? "",
    category: pkg.category ?? undefined,
    tag: pkg.tag ?? undefined,
    rating: pkg.rating ?? undefined,
    image: pkg.image ?? undefined,
    features: asStringArray(pkg.features),
    details: pkg.details ? asStringArray(pkg.details) : undefined,
  };
}

export function mapPrismaService(service: PrismaServiceWithPackages): Service {
  return {
    id: service.id,
    slug: service.slug,
    category: service.category,
    badge: service.badge ?? "",
    badgeColor: service.badgeColor ?? "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
    rating: service.rating ?? "",
    image: service.image,
    videoUrl: service.videoUrl ?? undefined,
    time: service.time ?? "",
    warranty: service.warranty ?? "",
    title: service.title,
    description: service.description,
    packages: service.packages.map(mapPrismaPackage),
    benefits: (service.benefits as unknown as ServiceBenefit[] | null) ?? undefined,
    howItWorks: (service.howItWorks as unknown as ServiceStep[] | null) ?? undefined,
    faqs: (service.faqs as unknown as ServiceFaq[] | null) ?? undefined,
  };
}

export async function getAllServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    ...serviceWithPackages,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPrismaService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const row = await prisma.service.findUnique({
    where: { slug },
    ...serviceWithPackages,
  });
  return row ? mapPrismaService(row) : null;
}

export async function getAllServiceSlugs(): Promise<string[]> {
  const rows = await prisma.service.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}
