"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { CategoryServicesModal } from "@/components/services/CategoryServicesModal";
import type { CategoryWithServices } from "@/types/category";

type Props = {
  categories: CategoryWithServices[];
};

export function CategoryGridClient({ categories }: Props) {
  const [openCategory, setOpenCategory] = useState<CategoryWithServices | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-6 w-full">
        {categories.map((cat) => (
          // Stays a real link so middle-click, cmd-click and crawlers keep
          // working; the click handler only intercepts a plain left-click.
          <Link
            key={cat.id}
            href={`/services?category=${cat.slug}`}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              setOpenCategory(cat);
            }}
            className="group flex flex-col items-center cursor-pointer"
          >
            {/* Background-image rather than next/image: an admin can paste an
                arbitrary image URL, and next.config remotePatterns would turn
                that into a runtime crash on the homepage. */}
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 bg-cover bg-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 mb-2 sm:mb-3 border border-slate-200/50 dark:border-slate-700/50"
              style={cat.image ? { backgroundImage: `url(${cat.image})` } : undefined}
            >
              <div className="absolute inset-0 bg-black/10 transition-colors duration-300" />

              <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 bg-white/30 dark:bg-black/40 backdrop-blur-md rounded-lg p-1.5 sm:p-2 border border-white/30 shadow-sm transition-colors duration-300 group-hover:bg-[#4285F4]/90 group-hover:border-[#4285F4]">
                <ClientIcon icon={cat.icon || "ph:tag-fill"} className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
              </div>
            </div>

            <h3 className="text-center text-[11px] sm:text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#4285F4] transition-colors leading-tight">
              {cat.name}
            </h3>
          </Link>
        ))}
      </div>

      {openCategory && (
        <CategoryServicesModal isOpen onClose={() => setOpenCategory(null)} category={openCategory} />
      )}
    </>
  );
}
