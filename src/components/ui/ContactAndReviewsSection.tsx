import { SectionHeader } from "@/components/ui/SectionHeader";
import { ClientIcon } from "@/components/ui/ClientIcon";
import Image from "next/image";

const REVIEWS = [
  {
    author: "Ashutosh Singh",
    time: "7 months ago",
    rating: 5,
    text: "By booking with Handy Experts, you can clearly see how experienced their professionals are. They know exactly where customers usually face difficulties and provide transparent pricing that makes the whole service journey much easier. I genuinely recommend everyone to try them at least once—once you do, you won't have any complaints about their work quality or their way of handling complex repairs.",
    avatar: "https://i.pravatar.cc/150?u=ashutosh",
  },
  {
    author: "Priya Sharma",
    time: "1 year ago",
    rating: 5,
    text: "Absolutely fantastic service! The painters were extremely professional and covered all my furniture before starting. The lines are crisp and the cleanup was spotless. Will definitely use them again for my next project.",
    avatar: "https://i.pravatar.cc/150?u=priya",
  },
  {
    author: "Rahul Verma",
    time: "1 year ago",
    rating: 4,
    text: "Very prompt plumbing service. They arrived within 45 minutes of my late-night booking and fixed the burst pipe quickly. Prices are slightly premium, but the peace of mind is totally worth it.",
    avatar: "https://i.pravatar.cc/150?u=rahul",
  }
];

export function ContactAndReviewsSection() {
  return (
    <section className="w-full bg-slate-50 dark:bg-[#020813] py-12 sm:py-16 px-4 sm:px-8 lg:px-16 overflow-hidden border-t border-slate-200 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badgeNumber="07"
          badgeText="Visit & Reviews"
          title={
            <>
              Find us in <span className="text-[#00B4FF]">Delhi.</span>
            </>
          }
          description="We are centrally located to dispatch our experts quickly. Read what your neighbors have to say."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          
          {/* LEFT: MAP CARD */}
          <div className="relative w-full min-h-[400px] h-full rounded-[24px] overflow-hidden bg-slate-200 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 shadow-sm group">

            {/* Google Maps Iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.114827184462!2d77.215956!3d28.629168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b741d057%3A0xc46188cb612f4cb7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full border-0 dark:invert-[90%] dark:hue-rotate-180 dark:contrast-80 dark:opacity-80 transition-all duration-500"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            {/* Tint Overlay to match theme perfectly */}
            <div className="absolute inset-0 bg-[#00B4FF]/10 dark:bg-[#020813]/40 mix-blend-overlay pointer-events-none transition-colors duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent dark:from-[#0B1120]/95 dark:via-[#0B1120]/20 dark:to-transparent pointer-events-none"></div>

            {/* Location Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col items-center text-center p-5 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[20px] shadow-xl hover:border-[#00B4FF]/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9B82F3] to-[#7B5EE4] flex items-center justify-center text-white shadow-lg shadow-[#9B82F3]/40 mb-2 group-hover:scale-110 transition-transform duration-500">
                <ClientIcon icon="ph:map-pin-fill" className="w-5 h-5" />
              </div>
              <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white mb-1.5">Handy Experts Headquarters</h3>
              <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300 max-w-sm mb-4 leading-tight">
                Block A, Connaught Place, Inner Circle, New Delhi, 110001
              </p>
              <button className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-md">
                <ClientIcon icon="ph:navigation-arrow-fill" className="w-3.5 h-3.5" />
                Get Directions
              </button>
            </div>
          </div>

          {/* RIGHT: INFO STACK */}
          <div className="flex flex-col gap-4">
            
            {/* Contact Information Card */}
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-[24px] p-5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white mb-5">Contact Information</h3>
              
              <div className="flex flex-col gap-4">
                {/* Address */}
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9B82F3]/10 dark:bg-[#9B82F3]/20 flex items-center justify-center text-[#9B82F3] group-hover:bg-[#9B82F3] group-hover:text-white transition-colors duration-300">
                    <ClientIcon icon="ph:map-pin-bold" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1.5">Address</h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      Block A, Connaught Place, Inner Circle, New Delhi, 110001
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#EC4899]/10 dark:bg-[#EC4899]/20 flex items-center justify-center text-[#EC4899] group-hover:bg-[#EC4899] group-hover:text-white transition-colors duration-300">
                    <ClientIcon icon="ph:clock-bold" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1.5">Working Hours</h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      Mon - Sun: 8:00 AM - 10:00 PM<br/>
                      Emergency Services: 24/7
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors duration-300">
                    <ClientIcon icon="ph:phone-call-bold" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1.5">Phone</h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-[#10B981] transition-colors">
                      +91 98765 43210
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#EF4444]/10 dark:bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444] group-hover:bg-[#EF4444] group-hover:text-white transition-colors duration-300">
                    <ClientIcon icon="ph:envelope-simple-bold" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1.5">Email</h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-[#EF4444] transition-colors">
                      hello@handyexperts.in
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Reviews Card */}
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col flex-grow hover:border-slate-300 dark:hover:border-slate-700 transition-colors h-[350px]">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white">Google Reviews</h3>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 text-[#F59E0B]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <ClientIcon key={i} icon="ph:star-fill" className="w-3.5 h-3.5" />
                    ))}
                  </div>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">4.9 <span className="text-slate-500 font-medium">(3,412 reviews)</span></span>
                </div>
              </div>

              {/* Scrollable Reviews List */}
              {/* Using native scrollbar styling classes inline for cleanliness */}
              <div className="flex-grow overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                
                {REVIEWS.map((review, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-[#131B2C] rounded-[16px] p-4 border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-1 text-[#F59E0B] mb-2">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <ClientIcon key={i} icon="ph:star-fill" className="w-3 h-3" />
                      ))}
                    </div>
                    <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-3">
                      {review.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image src={review.avatar} alt={review.author} width={24} height={24} className="w-6 h-6 rounded-full bg-slate-200" />
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white">{review.author}</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">{review.time}</span>
                    </div>
                  </div>
                ))}

              </div>

              {/* View All Button */}
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#131B2C] dark:hover:bg-slate-800/80 text-slate-900 dark:text-white text-[13px] font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700/50 group">
                <ClientIcon icon="ph:arrow-up-right-bold" className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                View All Reviews
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
