import { ScrollHero } from "@/components/ui/ScrollHero";
import { CategoryGrid } from "@/components/ui/CategoryGrid";
import { TrustSection } from "@/components/ui/TrustSection";
import { FeaturedServices } from "@/components/ui/FeaturedServices";
import { PopularServices } from "@/components/ui/PopularServices";
import { TestimonialsSection } from "@/components/ui/TestimonialsSection";
import { FAQSection } from "@/components/ui/FAQSection";

export default function Home() {
  return (
    <main className="w-full bg-white dark:bg-[#020813]">
      <ScrollHero />
      <CategoryGrid />
      <PopularServices />
      <TrustSection />
      <FeaturedServices />
      <TestimonialsSection />
      
      <FAQSection />
    </main>
  );
}
