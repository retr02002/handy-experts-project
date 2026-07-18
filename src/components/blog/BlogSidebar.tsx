import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface BlogSidebarProps {
  author: string;
  authorDescription?: string;
  tags?: string[];
}

export function BlogSidebar({ author, authorDescription, tags }: BlogSidebarProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* About the Author Card */}
      <div className="bg-white dark:bg-[#0A0F1C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ClientIcon icon="ph:user-circle" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
          About the Author
        </h4>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-800 dark:text-white">{author}</span>
          {authorDescription && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {authorDescription}
            </p>
          )}
        </div>
      </div>

      {/* Tags Card */}
      {tags && tags.length > 0 && (
        <div className="bg-white dark:bg-[#0A0F1C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ClientIcon icon="ph:tag" className="w-5 h-5 text-slate-400 dark:text-[#00B4FF]/70" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ClientIcon icon="ph:hash" className="w-3 h-3 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
