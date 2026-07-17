import React from "react";
import { ContactPageForm } from "@/components/ui/ContactPageForm";
import { ContactInfo } from "@/components/ui/ContactInfo";

export function ContactPageSection() {
  return (
    <section className="w-full bg-white dark:bg-[#020813] py-12 sm:py-16 px-4 sm:px-8 lg:px-16 border-t border-slate-200 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <ContactPageForm />
          <ContactInfo />
        </div>
      </div>
    </section>
  );
}
