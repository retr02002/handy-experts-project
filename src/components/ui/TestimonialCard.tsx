"use client";

import { useState, useRef, useEffect } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export interface TestimonialCardProps {
  rating: number;
  text: string;
  initials: string;
  name: string;
  location: string;
  avatarColor: string;
}

export function TestimonialCard({
  rating,
  text,
  initials,
  name,
  location,
  avatarColor,
}: TestimonialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && !isExpanded) {
        setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    };
    
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text, isExpanded]);

  return (
    <div className="group relative w-full h-[270px] sm:h-[300px] [perspective:1000px]">
      <div 
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isExpanded ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full flex flex-col bg-white dark:bg-[#131B2F] border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,180,255,0.08)] hover:border-[#00B4FF]/30 [backface-visibility:hidden]">
          
          {/* Header: User Info */}
          <div className="flex items-center gap-3.5 mb-5">
            {/* Avatar */}
            <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor} shadow-md group-hover:scale-105 transition-transform duration-300 ring-2 ring-slate-50 dark:ring-slate-800/50`}>
              {initials}
            </div>
            {/* Name & Location */}
            <div className="flex flex-col">
              <h4 className="text-[15px] sm:text-[16px] font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#00B4FF] transition-colors">
                {name}
              </h4>
              <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <ClientIcon icon="ph:map-pin-fill" className="w-3 h-3 opacity-70" />
                {location}
              </p>
            </div>
          </div>

          {/* Quote Text */}
          <div className="relative flex-grow flex flex-col">
            <ClientIcon icon="ph:quotes-fill" className="absolute -top-2 -left-2 w-8 h-8 text-slate-100 dark:text-slate-800/60 z-0 opacity-70 group-hover:text-[#00B4FF]/10 transition-colors pointer-events-none" />
            <p 
              ref={textRef}
              className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-4 relative z-10 italic"
            >
              "{text}"
            </p>
            
            {/* Stars centered vertically in remaining space */}
            <div className="flex-grow flex items-center pt-2 pb-2 relative z-10">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ClientIcon 
                    key={i} 
                    icon="ph:star-fill"
                    className={`w-4 h-4 ${i < rating ? "text-amber-400 group-hover:drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]" : "text-slate-200 dark:text-slate-700"} transition-all duration-300`} 
                  />
                ))}
              </div>
            </div>

            {/* Read more button pinned to the bottom */}
            <div className="h-5 flex items-center relative z-10">
              {isOverflowing && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-[12px] font-bold text-[#00B4FF] hover:text-[#0099D9] transition-colors focus:outline-none flex items-center gap-1 bg-[#00B4FF]/5 hover:bg-[#00B4FF]/10 px-2 py-1 rounded-md -ml-2"
                >
                  Read more
                  <ClientIcon icon="ph:arrow-u-down-right-bold" className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 w-full h-full flex flex-col bg-slate-50 dark:bg-[#0B1120] border border-[#00B4FF]/30 rounded-[24px] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_8px_32px_rgba(0,180,255,0.08)]">
          {/* Back Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
             <div className="flex items-center gap-2">
               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${avatarColor}`}>
                 {initials}
               </div>
               <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{name}</span>
             </div>
             <button
               onClick={() => setIsExpanded(false)}
               className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
               aria-label="Show less"
             >
               <ClientIcon icon="ph:arrow-u-up-left-bold" className="w-4 h-4" />
             </button>
          </div>
          
          {/* Back Content (Scrollable) */}
          <div className="flex-grow overflow-y-auto pr-2 pb-2 custom-scrollbar">
            <p className="text-[13px] sm:text-[14px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              "{text}"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
