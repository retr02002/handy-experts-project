import React from 'react';
import { Banner } from '@/components/ui/Banner';
import { AboutSection } from '@/components/sections/AboutSection';
import { JourneySection } from '@/components/sections/JourneySection';
import { TestimonialsSection } from '@/components/ui/TestimonialsSection';
import { PromoBanner } from '@/components/ui/PromoBanner';
import { FAQSection } from '@/components/ui/FAQSection';

export const metadata = {
  title: 'About Us | Handy Experts',
  description: 'Learn more about Handy Experts and our mission to provide top-notch home services.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      <Banner 
        title="About Handy Experts" 
        highlightedWord="Handy Experts"
        badge="Company Overview"
        badgeIcon="ph:buildings-fill"
        description="Launched in 2019, Handy Experts has rapidly established itself as a frontrunner among premium home service and system integration providers."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us' }
        ]}
        bgImage="/banner_about.png"
      />
      
      <AboutSection />
      
      <PromoBanner 
        title="Our Philosophy"
        description={
          <span className="block mt-2 italic text-lg text-slate-100 border-l-4 border-[#00B4FF] pl-4">
            &quot;We don&apos;t just fix homes. We restore peace of mind, elevate living spaces, and set a new standard for trust in every neighborhood we serve.&quot;
            <span className="block mt-4 text-sm font-bold text-[#00B4FF] not-italic">— The Handy Experts Team</span>
          </span>
        }
        imageSrc="/promo_banner_quote.png"
        imageAlt="Handy Experts Team"
        reverse={true}
      />

      <JourneySection />
      <TestimonialsSection hideBadge={true} />
      <FAQSection hideBadge={true} />
    </div>
  );
}
