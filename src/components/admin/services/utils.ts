import { z } from "zod";
import type { Category, Service, ServicePackage } from "@prisma/client";
import {
  serviceBenefitSchema,
  serviceStepSchema,
  serviceFaqSchema,
  ServiceInput,
  ServicePackageInput,
} from "@/lib/validations/service.schema";

export type ServiceWithPackages = Service & { packages: ServicePackage[]; category: Category | null };
export type PackageWithService = ServicePackage & { service: Pick<Service, "id" | "title" | "image"> };

function parseJsonArray<T>(schema: z.ZodType<T>, value: unknown): T[] {
  const result = z.array(schema).safeParse(value);
  return result.success ? result.data : [];
}

export function serviceToFormInput(service: ServiceWithPackages | Service): ServiceInput {
  return {
    title: service.title,
    slug: service.slug,
    categoryId: service.categoryId ?? "",
    badge: service.badge ?? "",
    badgeColor: service.badgeColor ?? "",
    rating: service.rating ?? "",
    image: service.image,
    videoUrl: service.videoUrl ?? "",
    time: service.time ?? "",
    warranty: service.warranty ?? "",
    description: service.description,
    benefits: parseJsonArray(serviceBenefitSchema, service.benefits),
    howItWorks: parseJsonArray(serviceStepSchema, service.howItWorks),
    faqs: parseJsonArray(serviceFaqSchema, service.faqs),
    isPopular: service.isPopular,
  };
}

export function packageToFormInput(pkg: ServicePackage): ServicePackageInput {
  return {
    serviceId: pkg.serviceId,
    name: pkg.name,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    time: pkg.time ?? "",
    category: pkg.category ?? "",
    tag: pkg.tag ?? "",
    rating: pkg.rating ?? "",
    image: pkg.image ?? "",
    features: parseJsonArray(z.string(), pkg.features),
    details: parseJsonArray(z.string(), pkg.details),
  };
}

export function emptyServiceInput(): ServiceInput {
  return {
    title: "",
    slug: "",
    categoryId: "",
    badge: "",
    badgeColor: "",
    rating: "",
    image: "",
    videoUrl: "",
    time: "",
    warranty: "",
    description: "",
    benefits: [],
    howItWorks: [],
    faqs: [],
    isPopular: false,
  };
}

export function emptyPackageInput(serviceId: string = ""): ServicePackageInput {
  return {
    serviceId,
    name: "",
    price: 0,
    originalPrice: 0,
    time: "",
    category: "",
    tag: "",
    rating: "",
    image: "",
    features: [],
    details: [],
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
