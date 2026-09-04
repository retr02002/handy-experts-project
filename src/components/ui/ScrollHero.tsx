import { HeroSearchBar } from "@/components/ui/HeroSearchBar";

export function ScrollHero() {
  return (
    <div className="relative flex flex-col justify-center w-full pt-32 pb-4 sm:pt-40 sm:pb-10 bg-white dark:bg-[#020813]">
      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full">
        <div className="flex flex-col items-center justify-center px-1 sm:px-4 max-w-4xl mx-auto w-full">
          
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
