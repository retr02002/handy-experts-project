import { MOCK_SERVICES } from "@/data/mockServices";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/services/ServiceDetailClient";
import { Metadata } from "next";

export async function generateStaticParams() {
  return MOCK_SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = MOCK_SERVICES.find((s) => s.slug === slug);
  if (!service) return { title: "Not Found" };
  return {
    title: `${service.title} - Handy Experts`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = MOCK_SERVICES.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pt-20">
      <ServiceDetailClient service={service} />
    </div>
  );
}
