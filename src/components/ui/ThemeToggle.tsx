"use client";

import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  variant?: 'default' | 'mobile-nav';
}

export function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    if (variant === 'mobile-nav') {
      return (
        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors group px-1 text-slate-500 dark:text-slate-400">
          <div className={`flex items-center justify-center w-[48px] h-[48px] -mt-6 rounded-full border-[3px] border-white dark:border-[#0B1120] shadow-md bg-slate-100 dark:bg-slate-800`}>
            <span className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold -mt-[3px] leading-none">Theme</span>
        </button>
      );
    }
    return (
      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shadow-sm">
        <span className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'mobile-nav') {
    const isDark = resolvedTheme === "dark";
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors group px-1 text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]"
        aria-label="Toggle theme"
      >
        <div className={`flex items-center justify-center w-[48px] h-[48px] -mt-6 rounded-full border-[3px] border-white dark:border-[#0B1120] shadow-md transition-transform group-hover:scale-110 group-active:scale-95 ${isDark ? 'bg-slate-800 text-white' : 'bg-gradient-to-tr from-[#00B4FF] to-[#0096d6] text-white'}`}>
          <Icon 
            icon={isDark ? "ph:moon-fill" : "ph:sun-fill"} 
            className="w-6 h-6" 
          />
        </div>
        <span className="text-[11px] font-bold -mt-[3px] leading-none">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Icon icon="ph:moon" width="18" height="18" />
      ) : (
        <Icon icon="ph:sun" width="18" height="18" />
      )}
    </button>
  );
}
