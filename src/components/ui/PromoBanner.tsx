import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface PromoBannerProps {
  title: React.ReactNode;
  description: React.ReactNode;
  buttonText?: string;
  buttonLink?: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean; // Determines text alignment (left vs right)
}

export function PromoBanner({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
  imageAlt,
  reverse = false,
}: PromoBannerProps) {
  return (
    <section className="relative w-full overflow-hidden min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] flex items-center">
      {/* Full Width Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center"
          priority
        />
        {/* Base dark overlay to ensure readability */}
        <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-900/50 mix-blend-multiply" />
        {/* Directional Gradient for layout flow */}
        <div className={`absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-${reverse ? 'l' : 'r'} from-[#0A0F1C]/95 via-[#0A0F1C]/70 to-transparent`} />
      </div>

      <ScrollReveal className="relative z-10 w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-16">
        <div className={`max-w-7xl mx-auto flex flex-col ${reverse ? 'sm:items-end sm:text-right' : 'sm:items-start sm:text-left'} text-center`}>
          
          {/* Glassmorphism Text Container */}
          <div className="max-w-[600px] backdrop-blur-md bg-[#0A0F1C]/50 p-6 sm:p-8 lg:p-10 rounded-2xl border border-white/10 shadow-2xl">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] mb-3 sm:mb-4 tracking-tight drop-shadow-md">
              {title}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-200 mb-6 sm:mb-8 max-w-md leading-relaxed font-medium drop-shadow-sm mx-auto sm:mx-0">
              {description}
            </p>
            
            {/* Premium Button */}
            {buttonText && buttonLink && (
              <Link 
                href={buttonLink}
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#00B4FF] to-[#0070FF] text-white font-bold rounded-full text-xs sm:text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(0,180,255,0.3)] hover:shadow-[0_8px_25px_rgba(0,180,255,0.5)] hover:-translate-y-0.5 overflow-hidden border border-white/20"
              >
                {/* Shine effect inside button */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none" />
                <span className="relative flex items-center gap-2">
                  {buttonText}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            )}
          </div>
          
        </div>
      </ScrollReveal>
    </section>
  );
}
