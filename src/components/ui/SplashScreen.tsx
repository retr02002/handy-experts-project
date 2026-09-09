"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const SPLASH_SEEN_KEY = "handyzo:splash-seen";
const SPLASH_DURATION_MS = 700;

/**
 * Branded first impression on the first load of a browser session only.
 *
 * This used to run a hardcoded 1500ms on *every* mount — including every
 * hard navigation (e.g. the post-login redirect), which meant the app spent
 * a second and a half behind a blank overlay on paths where the user was
 * just trying to get somewhere. Now it shows once per tab session and gets
 * out of the way roughly twice as fast.
 */
export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
    } catch {
      // Private mode / storage blocked — fall back to showing it.
    }

    if (seen) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
      } catch {
        // Nothing to do — worst case it shows again next navigation.
      }
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#020813] transition-opacity duration-500">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <Image
          src="/logo-org.svg"
          alt="Handyzo Logo"
          width={180}
          height={72}
          priority
          unoptimized
          className="h-16 w-auto object-contain mb-8 drop-shadow-md dark:brightness-0 dark:invert"
        />
        {/* Loading Circle */}
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-[#00B4FF] dark:border-t-[#00B4FF] rounded-full animate-spin shadow-lg"></div>
      </div>
    </div>
  );
}
