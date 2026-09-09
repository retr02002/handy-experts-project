import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Service, ServiceBenefit, ServiceFaq, ServicePackage, ServiceStep } from "@/types/service";
import type { Category, CategoryWithServices } from "@/types/category";

const serviceWithPackages = Prisma.validator<Prisma.ServiceDefaultArgs>()({
  include: { packages: { orderBy: { createdAt: "asc" } }, category: true },
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
    category: service.category
      ? {
          id: service.category.id,
          name: service.category.name,
          slug: service.category.slug,
          icon: service.category.icon,
          isPopular: service.category.isPopular,
        }
      : null,
    badge: service.badge ?? "",
    badgeColor: service.badgeColor ?? "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
    rating: service.rating ?? "",
    ratingAvg: service.ratingAvg,
    ratingCount: service.ratingCount,
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
    isPopular: service.isPopular,
  };
}

export async function getAllServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    ...serviceWithPackages,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPrismaService);
}

// cache() dedupes generateMetadata + the page body both calling this with the
// same slug in one request — raw Prisma calls aren't deduped by Next's fetch
// cache the way fetch() is, so without this it's two round trips per visit.
export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const row = await prisma.service.findUnique({
    where: { slug },
    ...serviceWithPackages,
  });
  return row ? mapPrismaService(row) : null;
});

export async function getAllServiceSlugs(): Promise<string[]> {
  const rows = await prisma.service.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

type PrismaCategory = Prisma.CategoryGetPayload<Record<string, never>>;

function mapPrismaCategory(category: PrismaCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description ?? undefined,
    icon: category.icon ?? undefined,
    image: category.image ?? undefined,
    isActive: category.isActive,
    isPopular: category.isPopular,
    sortOrder: category.sortOrder,
  };
}

/**
 * Active categories for the storefront (grid, slider tabs, /services tabs,
 * footer). The `name` tiebreak matters — sortOrder defaults to 0 for anything
 * the admin hasn't explicitly ordered, so without it the order is
 * nondeterministic between queries.
 *
 * Cached — this used to be a live query sitting directly in front of every
 * public page render (the root public layout awaits it for the footer), so
 * an uncached call here was a full DB round trip blocking every navigation.
 * The 300s revalidate is a safety net; category.actions.ts calls
 * revalidateTag("categories") on every mutation for near-instant freshness.
 */
export const getAllCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const rows = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map(mapPrismaCategory);
  },
  ["categories-all"],
  { tags: ["categories"], revalidate: 300 }
);

/** Homepage grid + its modal, in a single query (no N+1). Cached — same reasoning as getAllCategories. */
export const getCategoriesWithServices = unstable_cache(
  async (): Promise<CategoryWithServices[]> => {
    const rows = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        services: {
          select: {
            id: true,
            slug: true,
            title: true,
            image: true,
            rating: true,
            ratingAvg: true,
            ratingCount: true,
            badge: true,
            time: true,
            isPopular: true,
            packages: { select: { price: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return rows.map((row) => ({
      ...mapPrismaCategory(row),
      services: row.services.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        image: s.image,
        rating: s.rating ?? "",
        ratingAvg: s.ratingAvg,
        ratingCount: s.ratingCount,
        badge: s.badge ?? "",
        time: s.time ?? "",
        isPopular: s.isPopular,
        packageCount: s.packages.length,
        fromPrice: s.packages.length > 0 ? Math.min(...s.packages.map((p) => p.price)) : null,
      })),
    }));
  },
  ["categories-with-services"],
  { tags: ["categories"], revalidate: 300 }
);
