import React from "react";
import Image from "next/image";

export default function Loading() {
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
