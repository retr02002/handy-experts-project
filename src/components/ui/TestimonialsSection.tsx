import { TestimonialsCarousel } from "@/components/ui/TestimonialsCarousel";

const TESTIMONIALS = [
  {
    rating: 5,
    text: "AC service was booked at 8pm, done by 11am next day. Technician was neat and left the room spotless. Best experience so far. I usually expect delays or a mess when dealing with repairs in Delhi, but they brought their own tools, laid down a protective sheet, and even cleaned the filter of the second AC for free. Absolutely delighted with this kind of professionalism.",
    initials: "RS",
    name: "Ritu Sharma",
    location: "Vasant Kunj",
    avatarColor: "bg-[#00B4FF]",
  },
  {
    rating: 5,
    text: "Got the entire flat repainted before Diwali. Zero mess, transparent pricing, and daily WhatsApp updates from the site supervisor.",
    initials: "AM",
    name: "Arjun Malhotra",
    location: "GK-II",
    avatarColor: "bg-[#00B4FF]",
  },
  {
    rating: 4,
    text: "Deep cleaning made our new rental feel brand new. The team wore covers, moved furniture back exactly, and finished under time.",
    initials: "PN",
    name: "Priya Nair",
    location: "Dwarka",
    avatarColor: "bg-[#00B4FF]",
  },
  {
    rating: 5,
    text: "Pest control that actually worked. Six months later — still zero cockroaches. Their follow-up call was a nice surprise.",
    initials: "KA",
    name: "Kabir Anand",
    location: "Saket",
    avatarColor: "bg-[#00B4FF]",
  },
  {
    rating: 5,
    text: "Booked a plumber at midnight for a burst pipe. Someone was at my door in 48 minutes. This is what reliable feels like. The water was everywhere and I was panicking, but the technician calmly isolated the main valve, replaced the busted segment with quality PVC, and mopped up the mess before leaving. A true lifesaver when you need one the most!",
    initials: "SK",
    name: "Sneha Kapoor",
    location: "Rohini",
    avatarColor: "bg-[#00B4FF]",
  },
  {
    rating: 4,
    text: "Movers packed my entire 3BHK in one afternoon. Nothing broken, nothing lost. Priced 22% below the quote I got elsewhere.",
    initials: "DR",
    name: "Devansh Rao",
    location: "Noida 62",
    avatarColor: "bg-[#00B4FF]",
  },
];

export interface TestimonialsSectionProps {
  hideBadge?: boolean;
}

export function TestimonialsSection({ hideBadge }: TestimonialsSectionProps) {
  return (
    <section className="w-full bg-slate-50 dark:bg-[#020813] py-8 sm:py-12 px-4 sm:px-8 lg:px-16 overflow-hidden border-t border-slate-200 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto relative">
        <TestimonialsCarousel testimonials={TESTIMONIALS} hideBadge={hideBadge} />
      </div>
    </section>
  );
}
