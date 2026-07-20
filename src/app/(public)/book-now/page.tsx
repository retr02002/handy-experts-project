import React from 'react';
import { Banner } from '@/components/ui/Banner';
import { BookingSection } from '@/components/booking/BookingSection';

export const metadata = {
  title: 'Book an Appointment | Handy Experts',
  description: 'Book your next home service appointment quickly and securely with Handy Experts.',
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function BookNowPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
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
        <React.Suspense fallback={<div className="flex justify-center p-12"><span className="iconify ph-spinner animate-spin text-3xl text-blue-600" /></div>}>
          <BookingSection searchParams={searchParams} />
        </React.Suspense>
      </div>
    </div>
  );
}
