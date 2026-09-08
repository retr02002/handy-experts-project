import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ContactInfo() {
  const actions = [
    { id: 'call', icon: 'ph:phone-fill', title: 'Call Us', desc: '+91 9866716036', link: 'tel:+919866716036', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    { id: 'whatsapp', icon: 'ph:whatsapp-logo-fill', title: 'WhatsApp', desc: 'Message us', link: 'https://wa.me/919866716036', color: 'bg-[#25D366]', shadow: 'shadow-[#25D366]/20' },
    { id: 'email', icon: 'ph:envelope-simple-fill', title: 'Email', desc: 'contact@handyzo.com', link: 'mailto:contact@handyzo.com', color: 'bg-[#00B4FF]', shadow: 'shadow-[#00B4FF]/20' },
    { id: 'visit', icon: 'ph:map-pin-fill', title: 'Visit', desc: 'Hyderabad HQ', link: 'https://maps.google.com/?q=Mf-2+p.s+nagar+masab+tank+Mehdipatnam+Hyderabad+500028', color: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {actions.map((action) => (
        <a 
          key={action.id}
          href={action.link}
          target={action.id === 'visit' || action.id === 'whatsapp' ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center p-4 sm:p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-slate-200/50 dark:shadow-none dark:hover:border-[#00B4FF]/40 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
        >
          {/* Subtle colored glow in the background */}
          <div className={`absolute -top-8 -right-8 w-24 h-24 ${action.color} opacity-5 blur-2xl rounded-full transition-all duration-500 group-hover:scale-150 group-hover:opacity-15`} />
          
          <div className={`w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-[16px] sm:rounded-[20px] ${action.color} text-white flex items-center justify-center shadow-lg ${action.shadow} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <ClientIcon icon={action.icon} className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg mb-1">{action.title}</h3>
          <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium text-center truncate w-full px-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            {action.desc}
          </span>
        </a>
      ))}
    </div>
  );
}
