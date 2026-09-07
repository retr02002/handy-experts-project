import React from "react";
import { ContactPageForm } from "@/components/ui/ContactPageForm";
import { ContactInfo } from "@/components/ui/ContactInfo";

export function ContactPageSection() {
  return (
    <section className="relative w-full bg-slate-50 dark:bg-[#020813] min-h-[calc(100vh-80px)]">
      {/* Decorative background element */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-[#00B4FF]/10 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-24">
        
        {/* Mobile-app style Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-5">
            Get in touch
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium">
            Need help with a service? Want to partner with us? We&apos;re just a tap away.
          </p>
        </div>

        {/* Top Quick Actions (Mobile App Style) */}
        <div className="mb-16">
          <ContactInfo />
        </div>

        {/* Message Form & Image Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center relative z-10">
          {/* Left Side: Image (Hidden on mobile) */}
          <div className="hidden lg:block w-full h-full min-h-[450px] lg:min-h-[500px] relative rounded-[32px] overflow-hidden shadow-2xl">
            {/* We use an img tag with object-cover to act as the side hero image */}
            <img 
              src="https://images.unsplash.com/photo-1590402494587-44b71d7772f6?q=80&w=2070&auto=format&fit=crop" 
              alt="Contact Support" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <h3 className="text-3xl font-black text-white mb-3">We&apos;re here to help</h3>
              <p className="text-white/80 font-medium text-lg">Our expert team is available 24/7 to solve your problems and answer your questions.</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full">
            <ContactPageForm />
          </div>
        </div>

      </div>
    </section>
  );
}
