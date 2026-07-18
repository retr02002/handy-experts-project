"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function BlogActions() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(1); // Starting at 1 to match mockup

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleShare = () => {
    // In a real app, this might open a native share dialog or copy link to clipboard
    alert("Share functionality triggered!");
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0A0F1C] border border-slate-200 dark:border-slate-800 shadow-sm">
      <button
        onClick={handleLike}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
          liked
            ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
      >
        <ClientIcon
          icon={liked ? "ph:heart-fill" : "ph:heart"}
          className="w-5 h-5"
        />
        <span className="text-xs font-semibold">Like ({likeCount})</span>
      </button>

      <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2" />

      <button
        onClick={handleSave}
        className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl transition-colors ${
          saved
            ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
      >
        <ClientIcon
          icon={saved ? "ph:bookmark-simple-fill" : "ph:bookmark-simple"}
          className="w-5 h-5"
        />
        <span className="text-xs font-semibold">{saved ? "Saved" : "Save"}</span>
      </button>

      <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2" />

      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <ClientIcon icon="ph:share-network" className="w-5 h-5" />
        <span className="text-xs font-semibold">Share</span>
      </button>
    </div>
  );
}
