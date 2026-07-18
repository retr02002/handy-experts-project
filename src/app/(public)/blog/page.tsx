import React, { Suspense } from 'react';
import { Banner } from '@/components/ui/Banner';
import { BlogFilterMenu } from '@/components/blog/BlogFilterMenu';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { BlogList } from '@/components/blog/BlogList';
import { MOCK_BLOGS } from '@/data/mockBlogs';

export const metadata = {
  title: 'Blog | Handy Experts',
  description: 'Read the latest tips, guides, and news about home improvement and maintenance.',
};

export default async function BlogPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  
  const selectedCategories = Array.isArray(searchParams.category) 
    ? searchParams.category 
    : typeof searchParams.category === 'string' 
      ? [searchParams.category] 
      : [];
      
  const selectedReadTimes = Array.isArray(searchParams.readTime) 
    ? searchParams.readTime 
    : typeof searchParams.readTime === 'string' 
      ? [searchParams.readTime] 
      : [];

  const sortParam = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';

  // Filter logic
  let filteredBlogs = [...MOCK_BLOGS].filter(post => {
    // 1. Search Query
    if (query && !post.title.toLowerCase().includes(query) && !post.excerpt.toLowerCase().includes(query)) {
      return false;
    }
    
    // 2. Categories
    if (selectedCategories.length > 0 && !selectedCategories.some(cat => post.category.toLowerCase().includes(cat.toLowerCase()))) {
      return false;
    }
    
    // 3. Read Time
    if (selectedReadTimes.length > 0) {
      let minutes = parseInt(post.readTime.split(' ')[0]);
      if (isNaN(minutes)) minutes = 0;
      
      const match = selectedReadTimes.some(dur => {
        if (dur === "Under 5 min" && minutes < 5) return true;
        if (dur === "5-10 min" && minutes >= 5 && minutes <= 10) return true;
        if (dur === "Over 10 min" && minutes > 10) return true;
        return false;
      });
      
      if (!match) return false;
    }

    return true;
  });

  // Sort logic
  if (sortParam === 'newest') {
    filteredBlogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortParam === 'oldest') {
    filteredBlogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#020813]">
      <Banner 
        title="Our Blog" 
        highlightedWord="Blog"
        badge="Latest Insights"
        badgeIcon="ph:article-fill"
        description="Expert advice, tips, and inspiration for your home improvement projects and daily maintenance."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' }
        ]}
        bgImage="/banner_blog.png"
      />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
          
          {/* Right Sidebar (Filter Menu) */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24 self-start lg:z-20">
            <Suspense fallback={<div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>}>
              <BlogFilterMenu />
            </Suspense>
          </div>

          {/* Left Content Area (Search + Cards) */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-8">
            
            {/* Search Bar */}
            <div className="pb-4 lg:pb-0 border-b border-slate-100 dark:border-slate-800/60 lg:border-none">
              <Suspense fallback={<div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>}>
                <BlogSearch />
              </Suspense>
            </div>

            {/* Results Grid */}
            <BlogList posts={filteredBlogs} />
            
          </div>
        </div>
      </div>
    </div>
  );
}
