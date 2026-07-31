"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Service } from "@/types/service";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface ServiceVideoBannerProps {
  service: Service;
}

export function ServiceVideoBanner({ service }: ServiceVideoBannerProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVideoModalOpen]);

  return (
    <>
      {/* URBAN COMPANY STYLE VIDEO BANNER */}
      <div className="relative w-full h-[200px] sm:h-[260px] md:h-[280px] lg:h-[300px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 dark:border-slate-800 bg-slate-950 group shrink-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
          src={service.videoUrl || "/videos/hero-loop.mp4"}
          poster={service.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none"></div>

        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between z-10 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[#00B4FF] text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest border border-white/20 shrink-0 shadow-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] animate-ping"></span>
              <span>🔥 PRO VERIFIED TECHNIQUES</span>
            </span>
            <button 
              onClick={() => setIsVideoModalOpen(true)} 
              aria-label="Open video demonstration in modal"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-[#00B4FF] transition-colors border border-white/20 shrink-0 shadow-lg cursor-pointer"
            >
              <ClientIcon icon="ph:play-fill" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="min-w-0">
            <h3 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-lg mb-1 sm:mb-2 line-clamp-2">
              Ancient Techniques & Modern Tech • Flawless Care
            </h3>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-200 drop-shadow flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_#34d399]"></span>
                <span>100% Eco Hospital-Grade Care</span>
              </p>
              
              {/* Interactive Watch Demo Button */}
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00B4FF] via-blue-500 to-blue-600 text-white font-black text-[11px] sm:text-xs shadow-[0_4px_16px_rgba(0,180,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer z-20 uppercase tracking-wider shrink-0"
              >
                <ClientIcon icon="ph:play-circle-fill" className="w-4 h-4 sm:w-4 sm:h-4 text-white animate-pulse" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO DEMONSTRATION MODAL */}
      {isVideoModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#0B1426] border border-white/20 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col">
            
            <div className="px-5 py-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#00B4FF] text-white flex items-center justify-center font-black shadow-md shrink-0">
                  <ClientIcon icon="ph:video-camera-bold" className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-black text-white truncate">
                    {service.title} • HD Demonstration
                  </h3>
                  <p className="text-[11px] text-[#00B4FF] font-extrabold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Pro Verified Techniques & Equipment Showcase</span>
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Close video demo modal"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full bg-black aspect-video flex items-center justify-center">
              <video
                controls
                autoPlay
                preload="auto"
                playsInline
                className="w-full h-full object-contain max-h-[75vh]"
                src={service.videoUrl || "/videos/hero-loop.mp4"}
                poster={service.image}
              >
                Your browser does not support HTML5 video.
              </video>
            </div>

            <div className="px-5 py-3.5 bg-slate-900/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-300 font-bold">
              <span className="flex items-center gap-2">
                <ClientIcon icon="ph:shield-check-fill" className="w-4 h-4 text-[#00B4FF]" />
                <span>100% Verified German Equipment & Eco-Safe Chemicals</span>
              </span>
              <button 
                onClick={() => setIsVideoModalOpen(false)} 
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
