import React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/ui/ContactForm";
import { ContactResources } from "@/components/ui/ContactResources";

export function ContactSection() {
  return (
    <section className="w-full bg-white dark:bg-[#020813] py-12 sm:py-16 px-4 sm:px-8 lg:px-16 border-t border-slate-200 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badgeNumber="09"
          badgeText="Contact Us"
          title={
            <>
              Let&apos;s <span className="text-[#00B4FF]">Connect.</span>
            </>
          }
          description="Have a question or need assistance? Send us a message, or explore our latest resources for helpful tips."
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <ContactForm />
          <ContactResources />
        </div>
      </div>
    </section>
  );
}
