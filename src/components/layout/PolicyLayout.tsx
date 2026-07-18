import React from "react";
import { Banner } from "@/components/ui/Banner";

export interface PolicySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  description?: string;
  lastUpdated: string;
  sections: PolicySection[];
  contactEmail?: string;
}

export function PolicyLayout({
  title,
  description,
  lastUpdated,
  sections,
  contactEmail = "support@handyexperts.com",
}: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0F1C]">
      {/* Banner Component */}
      <Banner
        title={title}
        highlightedWord={title.split(" ").pop()}
        badge="LEGAL & POLICIES"
        badgeIcon="ph:shield-check-bold"
        description={description}
        bgImage="/banner_about.png"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal" },
          { label: title },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Sidebar (Sticky) */}
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-28 flex flex-col gap-6 z-10">
            {/* Table of Contents Box */}
            <div className="bg-white dark:bg-[#0F1626] rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 px-2">
                <div className="w-2 h-2 rounded-full border-2 border-indigo-500/50"></div>
                Contents
              </div>
              <nav className="flex flex-col gap-1">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group relative flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50"
                  >
                    <span className="w-6 shrink-0 opacity-50 font-bold group-hover:opacity-100 transition-opacity">
                      {index + 1}.
                    </span>
                    <span className="truncate">{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Support / Concerns Box */}
            <div className="bg-white dark:bg-[#151A29] rounded-3xl p-6 border border-slate-200 dark:border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.05)]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Have concerns?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Contact our team directly. We are here to help you resolve any issues or answer your questions.
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors break-all"
              >
                {contactEmail}
              </a>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="flex-1 w-full min-w-0">
            <div className="bg-white dark:bg-[#0F1626] rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
              
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-12 sm:gap-16">
                
                {/* Last Updated Label */}
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-6">
                  Last Updated: <span className="font-bold text-slate-700 dark:text-slate-300">{lastUpdated}</span>
                </div>

                {/* Render Sections */}
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-32 flex flex-col gap-6"
                  >
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {section.title}
                    </h2>
                    <div className="prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-p:text-[15px] sm:prose-p:text-base prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:font-bold prose-a:text-[#00B4FF] hover:prose-a:text-[#0080FF] prose-li:text-slate-600 dark:prose-li:text-slate-300 max-w-none">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
