import React from 'react';
import Link from 'next/link';
import { ClientIcon } from './ClientIcon';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface BannerProps {
  title: string;
  highlightedWord?: string;
  badge?: string;
  badgeIcon?: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
  bgImage?: string;
}

export function Banner({ 
  title, 
  highlightedWord,
  badge, 
  badgeIcon,
  description, 
  breadcrumbs, 
  bgImage 
}: BannerProps) {
  
  // Helper to highlight a specific word in the title
  const renderTitle = () => {
    if (!highlightedWord) return title;
    
    const parts = title.split(new RegExp(`(${highlightedWord})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlightedWord.toLowerCase() ? (
            <span key={i} className="text-[#00B4FF] bg-clip-text text-transparent bg-gradient-to-r from-[#00B4FF] to-[#0080FF]">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
      {/* Background */}
      {bgImage ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          {/* Subtle gradient overlay to show off the premium image while keeping text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/40 to-white/80 dark:from-slate-950/40 dark:via-slate-950/70 dark:to-slate-950/95" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-white to-white dark:from-blue-900/20 dark:via-slate-950 dark:to-slate-950">
          {/* Subtle noise/pattern overlay for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* 1. Breadcrumbs */}
        <div className="flex items-center justify-center flex-wrap gap-2 text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4FF] rounded-sm px-1">
                    {idx === 0 && <ClientIcon icon="ph:house-fill" className="w-3.5 h-3.5 mb-0.5 text-slate-400 dark:text-slate-500" />}
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold px-1 drop-shadow-sm">
                    {idx === 0 && <ClientIcon icon="ph:house-fill" className="w-3.5 h-3.5 mb-0.5 text-slate-400 dark:text-slate-500" />}
                    {crumb.label}
                  </span>
                )}
                
                {!isLast && (
                  <ClientIcon icon="ph:caret-right-bold" className="w-2.5 h-2.5 mx-0.5 text-slate-400 dark:text-slate-500" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 2. Optional Badge */}
        {badge && (
          <div className="mb-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 text-[#00B4FF] text-[10px] sm:text-[11px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-md">
            {badgeIcon && <ClientIcon icon={badgeIcon} className="w-3.5 h-3.5" />}
            {badge}
          </div>
        )}

        {/* 3. Title */}
        <h1 className="text-4xl sm:text-[44px] lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] sm:leading-[1.1] drop-shadow-sm">
          {renderTitle()}
        </h1>
        
        {/* 4. Description */}
        {description && (
          <p className="mt-5 sm:mt-6 text-[15px] sm:text-[16px] text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
