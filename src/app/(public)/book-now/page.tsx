import React from 'react';
import { Banner } from '@/components/ui/Banner';

export const metadata = {
  title: 'Book an Appointment | Handy Experts',
  description: 'Book your next home service appointment quickly and securely with Handy Experts.',
};

export default function BookNowPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Banner 
        title="Book an Appointment" 
        highlightedWord="Appointment"
        badge="Schedule Service"
        badgeIcon="ph:calendar-plus-fill"
        description="Ready to transform your home? Schedule a professional service easily and securely."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Book Now' }
        ]}
        bgImage="/banner_book.png"
      />
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📅</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Scheduling Portal</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Our comprehensive booking portal is currently under maintenance to serve you better. Please try again later.
          </p>
        </div>
      </div>
    </div>
  );
}
