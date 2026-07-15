"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ClientIcon } from "@/components/ui/ClientIcon";

const RESOURCES = [
  {
    category: "Cleaning Tips",
    date: "Mar 15, 2024",
    title: "The Ultimate Guide to Deep Cleaning Your Home",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
    link: "#"
  },
  {
    category: "Maintenance",
    date: "Feb 28, 2024",
    title: "5 Signs Your AC Needs a Professional Servicing",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600&auto=format&fit=crop",
    link: "#"
  },
  {
    category: "Home Improvement",
    date: "Jan 12, 2024",
    title: "How to Choose the Right Paint Color for Your Living Room",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop",
    link: "#"
  },
  {
    category: "Plumbing",
    date: "Dec 05, 2023",
    title: "Preventing Winter Pipe Bursts: What You Need to Know",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
    link: "#"
  }
];

export function ContactResources() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="h-[500px] lg:h-full flex flex-col bg-slate-50 dark:bg-[#0B1120] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">Latest Resources</h3>
      
      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {["All", "Cleaning Tips", "Maintenance", "Home Improvement"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab 
                ? "bg-[#00B4FF] text-white shadow-md shadow-[#00B4FF]/30" 
                : "bg-white dark:bg-[#131B2C] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Cards Container */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto pr-2 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 content-start [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
          
          {RESOURCES.filter(r => activeTab === "All" || r.category === activeTab).map((resource, idx) => (
            <a key={idx} href={resource.link} className="block group h-full">
              <div className="flex flex-col h-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow shadow-sm group-hover:border-[#00B4FF]/40">
                
                {/* Top: Image Box */}
                <div className="relative h-32 w-full overflow-hidden shrink-0">
                  <Image 
                    src={resource.image} 
                    alt={resource.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-900 dark:text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                      {resource.category}
                    </span>
                  </div>
                </div>

                {/* Bottom: Details Box */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <ClientIcon icon="ph:calendar-blank" className="w-3 h-3" />
                    {resource.date}
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#00B4FF] transition-colors line-clamp-2 mb-3">
                    {resource.title}
                  </h4>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    <span className="text-[11px] font-bold text-[#00B4FF]">Read Article</span>
                    <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-[#1A2333] flex items-center justify-center group-hover:bg-[#00B4FF] group-hover:text-white transition-colors text-slate-400">
                       <ClientIcon icon="ph:arrow-right-bold" className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                
              </div>
            </a>
          ))}

        </div>
      </div>
    </div>
  );
}
