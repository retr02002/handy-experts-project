"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  date: string;
  text: string;
}

export function BlogComments() {
  const [comments] = useState<Comment[]>([
    {
      id: "c1",
      author: "Art World",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Art", // Using dummy avatar
      date: "May 27, 2026",
      text: "Hello my name is abhi",
    },
  ]);

  return (
    <div className="flex flex-col gap-6 mt-12 pt-12 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Login Prompt Box */}
      <div className="w-full py-5 px-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Please log in to leave a comment.
        </p>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-4 mt-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-[#0A0F1C] border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={comment.avatar}
                alt={comment.author}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {comment.author}
                </span>
                <span className="text-[11px] font-medium text-slate-500 shrink-0">
                  {comment.date}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
