import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

export interface FeaturedServiceCardProps {
  card: {
    id: string;
    tag: string;
    title: string;
    description: string;
    action: string;
    image: string;
    span: string;
  };
}

export function FeaturedServiceCard({ card }: FeaturedServiceCardProps) {
  return (
    <div
      className={`group relative rounded-[1.5rem] overflow-hidden cursor-pointer bg-slate-200 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${card.span} border border-slate-200 dark:border-white/5`}
    >
      {/* Background Image with slight rotation and scale on hover for a dynamic feel */}
      <Image
        src={card.image}
        alt={card.title}
        fill
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105 group-hover:rotate-1 z-0"
      />
      
      {/* Cleaner Gradient Overlay - lets the image pop more */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-90" />

      {/* Top floating Tag */}
      <div className="absolute top-4 left-4 z-20">
        <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border border-white/20 shadow-sm transition-all duration-300 group-hover:bg-[#00B4FF] group-hover:border-[#00B4FF]">
          {card.tag}
        </span>
      </div>

      {/* Creative Floating Glass Panel Content Box */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-4 sm:p-5 z-20 flex flex-col justify-end bg-black/40 dark:bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 group-hover:bg-black/60 group-hover:border-[#00B4FF]/50 transition-all duration-500 shadow-lg">
        <h3 className="text-white text-lg sm:text-xl font-bold mb-1 tracking-tight drop-shadow-md group-hover:text-[#00B4FF] transition-colors duration-300">
          {card.title}
        </h3>
        <p className="text-slate-200 dark:text-slate-300 text-xs sm:text-sm font-medium max-w-md leading-relaxed drop-shadow-sm mb-3">
          {card.description}
        </p>
        
        <Link href="#" className="inline-flex items-center text-[#00B4FF] font-bold text-xs sm:text-sm hover:text-white transition-colors group/btn w-max">
          {card.action}
          <ClientIcon icon="ph:arrow-right-bold" className="ml-1.5 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
