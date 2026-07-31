import { getServiceBySlug, getAllServiceSlugs } from "@/lib/services-data";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/services/ServiceDetailClient";
import { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Not Found" };
  return {
    title: `${service.title} - Handyzo`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pt-20">
      <ServiceDetailClient service={service} />
    </div>
  );
}
