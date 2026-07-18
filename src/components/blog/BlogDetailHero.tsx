import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface BlogDetailHeroProps {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
}

export function BlogDetailHero({
  title,
  category,
  author,
  date,
  readTime,
  image,
}: BlogDetailHeroProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-8">

      {/* Top Bar: Back Link & Category */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#00B4FF] transition-colors"
        >
          <ClientIcon
            icon="ph:arrow-left-bold"
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          />
          Back to Blog
        </Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <div className="text-[#00B4FF] text-xs font-bold tracking-widest uppercase">
          {category}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 dark:text-white leading-[1.2] tracking-tight mb-6">
        {title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500 dark:text-slate-400 mb-10">
        <div className="flex items-center gap-2">
          <ClientIcon icon="ph:user-circle" className="w-4 h-4" />
          <span className="text-slate-800 dark:text-slate-300 font-medium">{author}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <ClientIcon icon="ph:calendar-blank" className="w-4 h-4" />
          {date}
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <ClientIcon icon="ph:clock" className="w-4 h-4" />
          {readTime} read
        </div>
      </div>

      {/* Clean, Simple Featured Image */}
      <div className="w-full aspect-[2/1] sm:aspect-[2.5/1] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
