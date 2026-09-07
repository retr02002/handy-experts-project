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
    <div className="group relative w-full h-[250px] sm:h-[270px] [perspective:1000px]">
      <div 
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isExpanded ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full flex flex-col bg-white dark:bg-[#131B2F] border border-slate-100 dark:border-slate-800/80 rounded-[20px] p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,180,255,0.06)] hover:border-[#00B4FF]/30 [backface-visibility:hidden]">
          
          {/* Header: User Info & Stars */}
          <div className="flex flex-row items-center justify-between mb-4">
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                {initials}
              </div>
              {/* Name & Location */}
              <div className="flex flex-col">
                <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#00B4FF] transition-colors">
                  {name}
                </h4>
                <p className="text-[11px] sm:text-[12px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {location}
                </p>
              </div>
            </div>
            
            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <ClientIcon 
                  key={i} 
                  icon="ph:star-fill"
                  className={`w-4 h-4 ${i < rating ? "text-amber-400 group-hover:drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" : "text-slate-200 dark:text-slate-700"} transition-all duration-300`} 
                />
              ))}
            </div>
          </div>

          {/* Quote Text */}
          <div className="relative flex-grow flex flex-col justify-between">
            <p 
              ref={textRef}
              className="text-[13px] sm:text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-4"
            >
              {text}
            </p>
            
            {/* Read more button */}
            <div className="mt-2 h-5 flex items-center">
              {isOverflowing && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-[12px] font-bold text-[#00B4FF] hover:text-[#0099D9] transition-colors focus:outline-none flex items-center gap-1"
                >
                  Read more
                  <ClientIcon icon="ph:arrow-u-down-right-bold" className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 w-full h-full flex flex-col bg-slate-50 dark:bg-[#0B1120] border border-[#00B4FF]/30 rounded-[20px] p-5 sm:p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-md">
          {/* Back Header */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-3">
             <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Full Review</span>
             <button
               onClick={() => setIsExpanded(false)}
               className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
               aria-label="Show less"
             >
               <ClientIcon icon="ph:arrow-u-up-left-bold" className="w-4 h-4" />
             </button>
          </div>
          
          {/* Back Content (Scrollable) */}
          <div className="flex-grow overflow-y-auto pr-2 pb-2">
            <p className="text-[13px] sm:text-[14px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {text}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
