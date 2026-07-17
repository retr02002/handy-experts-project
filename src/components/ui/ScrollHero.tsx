import { ClientIcon } from "@/components/ui/ClientIcon";

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
          <div className="w-full relative flex items-center bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-1.5 sm:p-2 border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mx-auto max-w-2xl transition-all focus-within:ring-2 focus-within:ring-[#00B4FF]/40 hover:-translate-y-0.5">
            
            {/* Inset Location Badge */}
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shrink-0 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer border border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50">
              <ClientIcon icon="ph:map-pin-fill" className="text-[#00B4FF] w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[50px] sm:max-w-[120px]">Delhi</span>
              <ClientIcon icon="ph:caret-down-bold" className="text-slate-400 w-3 h-3 ml-1 sm:ml-2" />
            </div>

            {/* Main Input */}
            <div className="flex items-center flex-1 px-3 sm:px-4">
              <input 
                type="text" 
                placeholder="What do you need?"
                className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[13px] sm:text-base font-medium min-w-0"
              />
            </div>

            {/* Search Action */}
            <button className="bg-gradient-to-br from-[#00B4FF] to-[#0070FF] text-white rounded-full w-9 h-9 sm:w-auto sm:h-11 sm:px-7 flex items-center justify-center transition-all shadow-[0_2px_10px_rgba(0,180,255,0.3)] hover:shadow-[0_4px_15px_rgba(0,180,255,0.5)] hover:scale-105 active:scale-95 shrink-0 group border border-white/20">
              <span className="hidden sm:inline font-bold text-[15px] tracking-wide">Search</span>
              <ClientIcon icon="ph:arrow-right-bold" className="sm:hidden w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
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
