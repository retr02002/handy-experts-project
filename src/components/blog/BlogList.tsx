import React from "react";
import { BlogCard } from "./BlogCard";
import { BlogPost } from "@/data/mockBlogs";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-[#131B2C] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <ClientIcon icon="ph:article-bold" className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No articles found</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          We couldn&apos;t find any articles matching your search or filter criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
