"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

/**
 * Root error boundary — this app had none until now, so any uncaught
 * render-time error anywhere left the user on a blank/broken screen with
 * no way back. `reset()` re-renders the segment that threw without a full
 * reload; "Go home" is the fallback for errors that reset() can't clear.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#020813] px-6 text-center">
      <Image
        src="/logo-org.svg"
        alt="Handyzo Logo"
        width={160}
        height={64}
        unoptimized
        className="h-12 w-auto object-contain dark:brightness-0 dark:invert"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ClientIcon icon="ph:warning-circle-bold" className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          A network hiccup or unexpected error interrupted this page. Try again, or head back home.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="h-11 px-5 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold transition-colors cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="h-11 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center hover:border-blue-400 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
