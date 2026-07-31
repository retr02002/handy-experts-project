import { ScrollHero } from "@/components/ui/ScrollHero";
import { CategoryGrid } from "@/components/ui/CategoryGrid";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { TrustSection } from "@/components/ui/TrustSection";
import { FeaturedServices } from "@/components/ui/FeaturedServices";
import { PopularServices } from "@/components/ui/PopularServices";
import { PromoBanner } from "@/components/ui/PromoBanner";
import { TestimonialsSection } from "@/components/ui/TestimonialsSection";
import { ContactAndReviewsSection } from "@/components/ui/ContactAndReviewsSection";
import { ContactSection } from "@/components/ui/ContactSection";
import { FAQSection } from "@/components/ui/FAQSection";

export default function Home() {
  return (
    <main className="w-full bg-white dark:bg-[#020813]">
      <ScrollHero />
      <PopularServices />
      <CategoryGrid />
      
      {/* First Promo Banner - Painting Theme */}
      <PromoBanner
        title={<>A New Look for <br />Your Home</>}
        description="Expert house painting that brings spaces to life. Premium paints, same-week completion, and absolute furniture safety guaranteed."
        buttonText="Book Now"
        buttonLink="#"
        imageSrc="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1600&auto=format&fit=crop"
        imageAlt="House Painting Services"
        reverse={false}
      />
      
      <TrustSection />
      <FeaturedServices />
      <HowItWorks />
      
      {/* Second Promo Banner - Cleaning Theme (Reversed) */}
      <PromoBanner
        title={<>Spotless spaces, <br className="hidden sm:block" />zero effort.</>}
        description="Experience our signature deep cleaning service. We scrub, polish, and sanitize every corner of your home so you don't have to."
        buttonText="View Cleaning Plans"
        buttonLink="#"
        imageSrc="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&auto=format&fit=crop"
        imageAlt="Professional Deep Cleaning"
        reverse={true}
      />

      <TestimonialsSection />
      
      <ContactAndReviewsSection />

      <FAQSection hideBadge={true} />

      <ContactSection />
    </main>
  );
}
