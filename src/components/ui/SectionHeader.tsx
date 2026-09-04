import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import React from "react";

export interface SectionHeaderProps {
  badgeNumber?: string;
  badgeText?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actionLink?: {
    text: string;
    href: string;
  };
  alignment?: "left" | "center";
  rightElement?: React.ReactNode;
}

export function SectionHeader({
  badgeNumber,
  badgeText,
  title,
  description,
  actionLink,
  alignment = "left",
  rightElement,
}: SectionHeaderProps) {
  const isCenter = alignment === "center";

  return (
    <div className={`flex flex-col lg:flex-row lg:items-end justify-between mb-4 sm:mb-6 lg:mb-8 gap-4 w-full ${isCenter ? "lg:justify-center" : ""}`}>
      <div className={`max-w-3xl ${isCenter ? "mx-auto text-center" : "text-left"}`}>
        {(badgeNumber || badgeText) && (
          <div className={`flex items-center space-x-2 text-[#00B4FF] font-bold text-xs uppercase tracking-widest mb-3 ${isCenter ? "justify-center" : ""}`}>
            {badgeNumber && <span>{badgeNumber}</span>}
            {badgeNumber && badgeText && <span className="w-4 h-px bg-[#00B4FF]"></span>}
            {badgeText && <span>{badgeText}</span>}
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3 sm:mb-4">
          {title}
        </h2>
      </div>
      {(actionLink || rightElement) && !isCenter && (
        <div className="pb-1 sm:pb-2 flex items-center justify-end">
          {actionLink && (
            <Link href={actionLink.href} className="inline-flex items-center text-[#00B4FF] font-bold text-xs sm:text-sm hover:text-[#0099D9] transition-colors group">
              {actionLink.text}
              <ClientIcon icon="ph:arrow-up-right-bold" className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
          {rightElement && (
            <div className="flex-shrink-0">
              {rightElement}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
