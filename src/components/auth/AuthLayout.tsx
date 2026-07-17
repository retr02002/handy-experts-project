import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface AuthLayoutProps {
  children: React.ReactNode;
  badgeText?: string;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center w-full px-4 sm:px-8 lg:px-12 pt-28 pb-12 lg:pt-40 lg:pb-20">
      {/* Full Page Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/auth-hero.png" alt="Background" className="absolute inset-0 w-full h-full object-cover" />

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-slate-900/60 lg:bg-gradient-to-r lg:from-slate-900/90 lg:via-slate-900/70 lg:to-slate-900/40" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">

        {/* Left Column (Content directly on background) - Hidden on mobile */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col items-start justify-center text-left">

          {/* Top Rating Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 px-4 mb-8">
            <ClientIcon icon="ph:star-fill" className="w-4 h-4 text-[#00B4FF]" />
            <span className="text-sm font-bold text-white leading-none">5.0 Rating</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl xl:text-[3.5rem] font-extrabold text-white mb-4 leading-[1.1] tracking-tight">
            Expert help, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0055FF]">just a click away.</span>
          </h1>

          <p className="text-base text-slate-300 max-w-sm font-medium mb-10 leading-relaxed">
            Join thousands of happy homeowners who trust HandyExperts.
          </p>

          {/* Compact Feature List */}
          <div className="flex flex-col gap-6">
            {[
              { icon: "ph:shield-check-bold", title: "Verified Professionals", desc: "Background-checked & trusted" },
              { icon: "ph:clock-bold", title: "On-Time Service", desc: "Punctual and reliable" },
              { icon: "ph:thumbs-up-bold", title: "Satisfaction Guaranteed", desc: "Quality work every time" }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-2.5 rounded-2xl text-white">
                  <ClientIcon icon={f.icon} className="w-5 h-5 text-[#00B4FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="text-[12px] font-medium text-slate-300 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column (Form) */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="w-full max-w-[480px] bg-white dark:bg-[#0A101D] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/30 backdrop-blur-xl relative">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
