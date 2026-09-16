import { HeroSearchBar } from "@/components/ui/HeroSearchBar";
import { HeroBannerCarousel } from "@/components/ui/HeroBannerCarousel";

export function ScrollHero() {
  return (
    <div className="relative flex flex-col justify-center w-full pt-24 pb-4 sm:pt-32 sm:pb-10 bg-white dark:bg-[#020813]">
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Banner spans full container width, not constrained by max-w-4xl */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroBannerCarousel />
        </div>
        
        <div className="flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full">
          <h1 className="hidden sm:block text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-tight mb-8 sm:mb-12 px-2 text-slate-900 dark:text-white">
            Your trusted experts <br className="hidden sm:block" />
            for every home service
          </h1>
          
          <HeroSearchBar />
        </div>
      </div>
    </div>
  );
}
