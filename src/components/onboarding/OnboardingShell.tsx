import React from "react";

export function OnboardingShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 sm:relative sm:inset-auto sm:h-auto sm:min-h-[100dvh] w-full flex flex-col overflow-hidden sm:overflow-visible sm:items-center sm:justify-center sm:px-4 sm:py-10 z-50 sm:z-auto">
      {/* Background — desktop only; mobile stays a plain full-screen surface, app-style */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/auth-hero.png" alt="" className="hidden sm:block absolute inset-0 w-full h-full object-cover" />
      <div className="hidden sm:block absolute inset-0 bg-slate-900/70" />

      {/* Mobile brand header */}
      <div className="sm:hidden shrink-0 flex items-center justify-center pt-[max(env(safe-area-inset-top),18px)] pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-org.svg" alt="Handyzo" className="h-7 w-auto dark:brightness-0 dark:invert" />
      </div>

      <div
        className={`relative z-10 w-full flex-1 min-h-0 sm:flex-initial sm:min-h-0 ${
          wide ? "sm:max-w-2xl" : "sm:max-w-[420px]"
        } bg-white dark:bg-[#0A101D] sm:border sm:border-slate-200/60 sm:dark:border-slate-800/60 sm:rounded-3xl sm:shadow-2xl sm:shadow-black/30 sm:max-h-[88vh] flex flex-col overflow-hidden transition-[max-width] duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
