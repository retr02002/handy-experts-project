import { ClientIcon } from "@/components/ui/ClientIcon";
import { HeroSearchBar } from "@/components/ui/HeroSearchBar";
const TEXT_CONTENT = {
  badge: "Home services · Delhi NCR",
  title: "Reliable pros.",
  titleHighlight: "Radically simple bookings.",
  description: "Verified home experts for every job in the city — from a leaky tap to a full renovation. Priced upfront, tracked live, and guaranteed on delivery.",
};

export function ScrollHero() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-center w-full overflow-hidden bg-black dark:bg-[#0f172a]">
      
      {/* Video Background */}
      <video
        src="/videos/hero-loop.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-40 pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        controls={false}
      />
      
      {/* Radial Gradient Overlay ONLY in dark mode now */}
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.95)_100%)]" />
      
      {/* Overlay Grid lines (Subtle) - Set to white so it's visible on dark backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-24 sm:py-32 w-full mt-10">
        
        {/* Single Hero Slide */}
        <div className="flex flex-col items-center justify-center px-1 sm:px-4 max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 sm:px-4 sm:py-1.5 mb-4 text-[10px] sm:text-xs font-semibold text-white border border-white/20 shadow-sm">
            <ClientIcon icon="ph:sparkle-fill" className="text-[#00B4FF]" />
            <span className="drop-shadow-sm">{TEXT_CONTENT.badge}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-center tracking-tight mb-3 sm:mb-4 px-2">
            <span className="text-white drop-shadow-xl">{TEXT_CONTENT.title}</span> <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF] drop-shadow-xl">{TEXT_CONTENT.titleHighlight}</span>
          </h1>
          
          <p className="text-sm sm:text-lg md:text-xl text-white/90 text-center max-w-2xl mb-8 sm:mb-10 px-2 font-medium leading-relaxed drop-shadow-lg">
            {TEXT_CONTENT.description}
          </p>
          
          {/* Fresh UI Concept: Unified Search Command Bar */}
          <HeroSearchBar />
          
          {/* Features List */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-10 text-[11px] sm:text-sm font-semibold text-white/95 drop-shadow-md">
            <span className="flex items-center px-2 py-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00B4FF] mr-2 shadow-[0_0_8px_rgba(0,180,255,0.6)]" />Verified pros</span>
            <span className="flex items-center px-2 py-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00B4FF] mr-2 shadow-[0_0_8px_rgba(0,180,255,0.6)]" />Upfront pricing</span>
            <span className="flex items-center px-2 py-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00B4FF] mr-2 shadow-[0_0_8px_rgba(0,180,255,0.6)]" />Same-day slots</span>
            <span className="flex items-center px-2 py-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00B4FF] mr-2 shadow-[0_0_8px_rgba(0,180,255,0.6)]" />30-day warranty</span>
          </div>
        </div>
      </div>
    </div>
  );
}
