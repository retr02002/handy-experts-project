import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { BlogPost } from "@/data/mockBlogs";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="relative flex flex-col h-full rounded-[2rem] bg-slate-50 dark:bg-[#060B14] overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-lg dark:hover:shadow-[#00B4FF]/5 hover:-translate-y-1">
        
        {/* Top Image Section */}
        <div className="relative w-full h-[240px] shrink-0 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay Gradient (Optional, for better text visibility if we put badges over it) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {/* Category Badge */}
            <span className="inline-flex px-3.5 py-1.5 rounded-full bg-[#00B4FF] text-white text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-md">
              {post.category}
            </span>

            {/* Read Time Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium border border-white/10 shadow-sm">
              <ClientIcon icon="ph:clock-fill" className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Overlapping Content Panel */}
        <div className="relative flex flex-col flex-1 z-10 -mt-6 mx-3 mb-3 bg-white dark:bg-[#0B1221] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/60 shadow-xl dark:shadow-none transition-colors">
          
          {/* Author & Date */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 tracking-wide">
            <span className="font-bold text-slate-700 dark:text-slate-300">{post.author}</span>
            <span className="uppercase text-[10px] sm:text-xs tracking-wider">{post.date}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-[#00B4FF] transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1">
            {post.excerpt}
          </p>

          {/* Read Article Link */}
          <div className="flex items-center gap-2 text-[#00B4FF] text-xs sm:text-sm font-bold tracking-widest uppercase mt-auto">
            READ ARTICLE
            <ClientIcon icon="ph:arrow-up-right-bold" className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
        
      </div>
    </Link>
  );
}
