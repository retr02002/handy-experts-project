import React from 'react';
import { getAllServices, getAllCategories } from '@/lib/services-data';
import { CustomerServicesClient } from './CustomerServicesClient';

export const metadata = {
  title: 'Our Services | Dashboard',
  description: 'Book new services directly from your dashboard.',
};

export default async function CustomerServicesPage(props: {
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

  const [allServices, categories] = await Promise.all([getAllServices(), getAllCategories()]);

  // Filter logic
  const filteredServices = allServices.filter(service => {
    // 1. Search Query
    if (query && !service.title.toLowerCase().includes(query) && !service.description.toLowerCase().includes(query)) {
      return false;
    }
    // 2. Categories
    if (selectedCategories.length > 0) {
      const cat = service.category;
      if (!cat || !selectedCategories.some(sel => sel === cat.slug || sel === cat.name)) {
        return false;
      }
    }
    // 3. Ratings
    if (ratingParam > 0) {
      const serviceRating = parseFloat(service.rating.split(' ')[0]);
      if (serviceRating < ratingParam) {
        return false;
      }
    }
    // 4. Price
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

  // Sort logic
  const sortParam = typeof searchParams.sort === 'string' ? searchParams.sort : 'recommended';
  if (sortParam === 'price_asc') {
    filteredServices.sort((a, b) => (a.packages[0]?.price || 0) - (b.packages[0]?.price || 0));
  } else if (sortParam === 'price_desc') {
    filteredServices.sort((a, b) => (b.packages[0]?.price || 0) - (a.packages[0]?.price || 0));
  }

  const selectedCategoryName = selectedCategories.length > 0 && selectedCategories[0] !== "All"
    ? categories.find(c => c.slug === selectedCategories[0] || c.name === selectedCategories[0])?.name || "Services"
    : "All Services";

  return (
    <CustomerServicesClient 
      categories={categories}
      filteredServices={filteredServices}
      viewType={viewType}
      selectedCategoryName={selectedCategoryName}
    />
  );
}
