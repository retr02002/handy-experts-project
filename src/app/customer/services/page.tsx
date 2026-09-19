import React, { Suspense } from 'react';
import { getAllServices, getAllCategories } from '@/lib/services-data';
import { CustomerServicesClient } from './CustomerServicesClient';

export const metadata = {
  title: 'Our Services | Dashboard',
  description: 'Book new services directly from your dashboard.',
};

// No searchParams read here on purpose — filtering is handled entirely
// client-side in CustomerServicesClient (useSearchParams + a local
// recompute over data already fetched below), same fix already applied to
// the public /services page — see that page's own comment for why this
// matters: reading searchParams here would force a full server round trip
// on every filter/sort click instead of an instant in-browser recompute.
export default async function CustomerServicesPage() {
  const [allServices, categories] = await Promise.all([getAllServices(), getAllCategories()]);

  return (
    <Suspense fallback={<div className="flex-1 w-full h-full bg-white dark:bg-[#020813]" />}>
      <CustomerServicesClient allServices={allServices} categories={categories} />
    </Suspense>
  );
}
