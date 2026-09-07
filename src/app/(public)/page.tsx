export const dynamic = "force-dynamic";
import { ScrollHero } from "@/components/ui/ScrollHero";
import { CategoryGrid } from "@/components/ui/CategoryGrid";
import { FeaturedServices } from "@/components/ui/FeaturedServices";
import { PopularServices } from "@/components/ui/PopularServices";
import { CategoryServicesSections } from "@/components/ui/CategoryServicesSections";
import { TestimonialsSection } from "@/components/ui/TestimonialsSection";
import { FAQSection } from "@/components/ui/FAQSection";

export default function Home() {
  return (
    <main className="w-full bg-white dark:bg-[#020813]">
      <ScrollHero />
      <CategoryGrid />
      <PopularServices />
      <CategoryServicesSections />
      <FeaturedServices />
      <TestimonialsSection />
      
      <FAQSection />
    </main>
  );
}
