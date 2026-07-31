import React, { Suspense } from 'react';
import { Banner } from '@/components/ui/Banner';
import { GlobalSearchBar } from '@/components/ui/GlobalSearchBar';
import { ServicesFilterMenu } from '@/components/ui/ServicesFilterMenu';
import { ServicesList } from '@/components/services/ServicesList';
import { getAllServices } from '@/lib/services-data';
import { CategoryTabs } from '@/components/ui/CategoryTabs';

export const metadata = {
  title: 'Our Services | Handyzo',
  description: 'Explore our wide range of professional home services.',
};

export default async function ServicesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const viewType = (typeof searchParams.type === 'string' && searchParams.type === 'packages') ? 'packages' : 'services';
  
  const selectedCategories = Array.isArray(searchParams.category) 
    ? searchParams.category 
    : typeof searchParams.category === 'string' 
      ? [searchParams.category] 
      : [];
      
  const selectedTags = Array.isArray(searchParams.tag) 
    ? searchParams.tag 
    : typeof searchParams.tag === 'string' 
      ? [searchParams.tag] 
      : [];

  const selectedDurations = Array.isArray(searchParams.duration) 
    ? searchParams.duration 
    : typeof searchParams.duration === 'string' 
      ? [searchParams.duration] 
      : [];

  const ratingParam = typeof searchParams.rating === 'string' ? parseFloat(searchParams.rating) : 0;
  
  const minPrice = typeof searchParams.minPrice === 'string' ? parseInt(searchParams.minPrice) : 0;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseInt(searchParams.maxPrice) : 10000;

  const allServices = await getAllServices();

  // Filter logic
  const filteredServices = allServices.filter(service => {
    // 1. Search Query
    if (query && !service.title.toLowerCase().includes(query) && !service.description.toLowerCase().includes(query)) {
      return false;
    }
    // 2. Categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(service.category)) {
      return false;
    }
    // 3. Ratings
    if (ratingParam > 0) {
      const serviceRating = parseFloat(service.rating.split(' ')[0]);
      if (serviceRating < ratingParam) {
        return false;
      }
    }
    // 4. Price (check if any package is within range — services with no packages yet aren't excluded by this)
    if (service.packages.length > 0) {
      const hasPackagesInPriceRange = service.packages.some(pkg => pkg.price >= minPrice && pkg.price <= maxPrice);
      if (!hasPackagesInPriceRange) {
        return false;
      }
    }
    // 5. Popularity (Tags)
    if (selectedTags.length > 0) {
      if (!service.badge || !selectedTags.some(tag => service.badge.toLowerCase().includes(tag.toLowerCase()))) {
        return false;
      }
    }
    // 6. Duration
    if (selectedDurations.length > 0) {
      let minutes = 0;
      if (service.time.includes("hr") || service.time.includes("hour")) {
        minutes = parseFloat(service.time) * 60;
      } else if (service.time.includes("min")) {
        minutes = parseFloat(service.time);
      }
      
      const match = selectedDurations.some(dur => {
        if (dur === "Under 1 Hour" && minutes < 60) return true;
        if (dur === "1-3 Hours" && minutes >= 60 && minutes <= 180) return true;
        if (dur === "Over 3 Hours" && minutes > 180) return true;
        return false;
      });
      
      if (!match) return false;
    }

    return true;
  });

  // Sort logic (Mock implementation based on price of first package or rating)
  const sortParam = typeof searchParams.sort === 'string' ? searchParams.sort : 'recommended';
  if (sortParam === 'price_asc') {
    filteredServices.sort((a, b) => (a.packages[0]?.price || 0) - (b.packages[0]?.price || 0));
  } else if (sortParam === 'price_desc') {
    filteredServices.sort((a, b) => (b.packages[0]?.price || 0) - (a.packages[0]?.price || 0));
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#020813]">
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
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar (Filter Menu) */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24 self-start lg:z-20">
            <Suspense fallback={<div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>}>
              <ServicesFilterMenu />
            </Suspense>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-8">
            
            {/* Header Area in Content */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Find trusted services for your home
                </h2>
              </div>
              
              {/* Global Search Bar (Sticky within the flow or just top) */}
              <div className="sticky top-24 z-30 bg-white/80 dark:bg-[#020813]/80 backdrop-blur-xl pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <Suspense fallback={<div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>}>
                  <GlobalSearchBar placeholder="Search for cleaning, repairs, painting..." />
                </Suspense>
              </div>

              {/* Category Tabs */}
              <Suspense fallback={<div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>}>
                <CategoryTabs />
              </Suspense>
            </div>

            {/* Results Grid */}
            <ServicesList services={filteredServices} viewType={viewType} />
            
          </div>
        </div>
      </div>
    </div>
  );
}
