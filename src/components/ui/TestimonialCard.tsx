"use client";

import { useState, useRef, useEffect } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export interface TestimonialCardProps {
  rating: number;
  text: string;
  initials: string;
  name: string;
  location: string;
  avatarColor: string; // e.g. "bg-[#00B4FF]"
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
    <div className="group relative w-full h-full flex flex-col justify-between bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-[24px] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,180,255,0.15)] hover:border-[#00B4FF]/40 overflow-hidden">
      
      {/* Premium Glassmorphism Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00B4FF]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Background Watermark Quote Icon */}
      <div className="absolute top-4 right-6 text-slate-100 dark:text-white/[0.03] pointer-events-none transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:text-[#00B4FF]/[0.04]">
        <ClientIcon icon="ph:quotes-fill" className="w-20 h-20 sm:w-24 sm:h-24" />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Stars */}
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <ClientIcon 
              key={i} 
              icon={i < rating ? "ph:star-fill" : "ph:star"} 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${i < rating ? "text-[#00B4FF] group-hover:scale-110 drop-shadow-[0_0_8px_rgba(0,180,255,0.4)]" : "text-slate-300 dark:text-slate-700"}`} 
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        {/* Quote Text (Always clamped) */}
        <div className="mb-8 relative flex-grow flex flex-col">
          <p 
            ref={textRef}
            className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white line-clamp-3"
          >
            {text}
          </p>
          
          {/* Read more button (only visible if text naturally overflows 3 lines) */}
          <div className="h-6 mt-2">
            {isOverflowing && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs font-bold text-[#00B4FF] hover:text-[#0099D9] transition-colors focus:outline-none flex items-center gap-1"
              >
                Read more
                <ClientIcon icon="ph:caret-down-bold" className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="relative z-10 flex items-center gap-3 mt-auto">
        {/* Avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#00B4FF] opacity-0 group-hover:opacity-30 group-hover:scale-125 transition-all duration-500 blur-sm"></div>
          <div className={`relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${avatarColor} ring-2 ring-white/50 dark:ring-[#0B1120] group-hover:ring-[#00B4FF]/30 transition-all duration-300`}>
            {initials}
          </div>
        </div>
        
        {/* Name & Location */}
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#00B4FF] transition-colors duration-300">
            {name}
          </h4>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {location}
          </p>
        </div>
      </div>

      {/* Expanded Text Overlay (Does not affect card dimensions) */}
      <div 
        className={`absolute inset-0 z-50 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-sm p-6 sm:p-8 flex flex-col h-full overflow-y-auto transition-all duration-300 ${isExpanded ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"}`}
      >
        <div className="flex-grow">
          <p className="text-sm sm:text-[15px] text-slate-900 dark:text-white leading-relaxed font-medium">
            {text}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-6 self-start text-xs font-bold text-[#00B4FF] hover:text-[#0099D9] transition-colors focus:outline-none flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full"
        >
          <ClientIcon icon="ph:caret-up-bold" className="w-3 h-3" />
          Show less
        </button>
      </div>
      
    </div>
  );
}
