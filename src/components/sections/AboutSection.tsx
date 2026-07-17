import React from 'react';
import { FeatureCard } from '../ui/FeatureCard';
import { ClientIcon } from '../ui/ClientIcon';

export function AboutSection() {
  return (
    <section className="w-full py-10 sm:py-16 relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Subtle dotted background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-stretch">

          {/* Left Content */}
          <div className="flex-1 flex flex-col justify-center order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 dark:text-white leading-[1.2] mb-4">
              Driving Innovation in <span className="text-[#00B4FF]">Premium Home Services</span>
            </h2>

            <div className="space-y-3.5 text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8">
              <p>
                By streamlining the process of deploying expert services to your home, our suite of solutions helps homeowners and businesses thrive. We offer a wide range of professional services including <strong className="text-slate-900 dark:text-slate-200">Plumbing, Electrical, HVAC, Carpentry, and Smart Home Integrations</strong> at a competitive cost. We have built a solid reputation over the years within this short span of time with a customer-first approach.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              <FeatureCard
                icon="ph:shield-check-fill"
                title="Verified Experts"
                description="Technical expert team with full background checks for all your needs."
                iconBgColor="bg-orange-50 dark:bg-orange-500/10"
                iconColor="text-orange-500"
              />
              <FeatureCard
                icon="ph:rocket-launch-fill"
                title="Fast Deployment"
                description="Qualified testing teams double-check every service deployment."
                iconBgColor="bg-blue-50 dark:bg-blue-500/10"
                iconColor="text-blue-500"
              />
              <FeatureCard
                icon="ph:buildings-fill"
                title="11 Service Centers"
                description="Delivering low-latency solutions to customers globally in a timely manner."
                iconBgColor="bg-cyan-50 dark:bg-cyan-500/10"
                iconColor="text-cyan-500"
              />
              <FeatureCard
                icon="ph:headset-fill"
                title="24/7 Support"
                description="Offering 24x7 expert support via live chat, email, and phone."
                iconBgColor="bg-purple-50 dark:bg-purple-500/10"
                iconColor="text-purple-500"
              />
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative order-1 lg:order-2 min-h-[350px] sm:min-h-[450px]">
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
                alt="Our Team at Work"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Subtle decorative circles over image matching reference */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-blue-400/30 border-dashed pointer-events-none animate-[spin_60s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cyan-400/20 pointer-events-none" />
            </div>

            {/* Top Right Floating Badge */}
            <div className="absolute top-4 right-4 sm:-top-6 sm:-right-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-3 sm:p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800 animate-fade-in-down z-10">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/100?img=1" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-slate-900" alt="User" />
                <img src="https://i.pravatar.cc/100?img=2" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-slate-900" alt="User" />
                <img src="https://i.pravatar.cc/100?img=3" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-slate-900" alt="User" />
              </div>
              <div className="flex flex-col pr-1">
                <span className="text-[13px] sm:text-sm font-black text-slate-900 dark:text-white leading-none mb-0.5">10k+</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider">Happy Clients</span>
              </div>
            </div>

            {/* Bottom Left Floating Badge */}
            <div className="absolute bottom-4 left-4 sm:-bottom-8 sm:-left-8 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 sm:p-6 flex items-center gap-3 sm:gap-4 border border-slate-100 dark:border-slate-800 animate-fade-in-up z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ClientIcon icon="ph:medal-fill" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">2019</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 tracking-widest uppercase">Year Established</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
