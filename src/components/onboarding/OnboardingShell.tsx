import React from "react";

export function OnboardingShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="relative w-full flex-1 flex flex-col sm:h-auto sm:min-h-[100dvh] overflow-hidden sm:items-center sm:justify-center px-4 py-8 sm:py-10">
      {/* Background — desktop only; mobile stays a plain full-screen surface, app-style */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/auth-hero.png" alt="" className="hidden sm:block absolute inset-0 w-full h-full object-cover" />
      <div className="hidden sm:block absolute inset-0 bg-slate-900/70" />

      {/* Mobile brand header */}
      <div className="sm:hidden shrink-0 flex items-center justify-center pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-org.svg" alt="Handyzo" className="h-7 w-auto dark:brightness-0 dark:invert" />
      </div>

      <div
        className={`relative z-10 w-full flex-1 sm:flex-initial ${
          wide ? "sm:max-w-2xl" : "sm:max-w-[420px]"
        } bg-white dark:bg-[#0A101D] sm:border sm:border-slate-200/60 sm:dark:border-slate-800/60 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/30 flex flex-col mx-auto transition-[max-width] duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
