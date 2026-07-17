import React from 'react';
import { Banner } from '@/components/ui/Banner';

export const metadata = {
  title: 'Our Services | Handy Experts',
  description: 'Explore our wide range of professional home services.',
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Banner 
        title="Our Services" 
        highlightedWord="Services"
        badge="What We Do"
        badgeIcon="ph:wrench-fill"
        description="Explore our comprehensive range of professional home services designed to make your life easier and your home better."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services' }
        ]}
        bgImage="/banner_services.png"
      />
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🔧</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Services Catalog</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Our comprehensive list of services will be displayed here soon. We are preparing the best packages for you.
          </p>
        </div>
      </div>
    </div>
  );
}
