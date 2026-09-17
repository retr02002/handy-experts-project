import React, { Suspense } from 'react';
import { getAllServices, getAllCategories } from '@/lib/services-data';
import { ServicesPageClient } from '@/components/services/ServicesPageClient';

export const metadata = {
  title: 'Our Services | Handyzo',
  description: 'Explore our wide range of professional home services.',
};

// No searchParams read here on purpose — category/filter clicks are handled
// entirely client-side in ServicesPageClient (useSearchParams + a local
// recompute over data already fetched below), so this page itself doesn't
// need to be dynamically re-rendered on every query-string change. That's
// what made switching sidebar tabs feel instant on localhost but visibly
// laggy in production: each click used to trigger a full server round trip
// just to re-run an in-memory array filter.
export default async function ServicesPage() {
  const [allServices, categories] = await Promise.all([getAllServices(), getAllCategories()]);

  return (
    <Suspense fallback={<div className="min-h-screen pt-20 md:pt-24 bg-white dark:bg-[#020813]" />}>
      <ServicesPageClient allServices={allServices} categories={categories} />
    </Suspense>
  );
}
