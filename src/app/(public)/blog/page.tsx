import React from 'react';
import { Banner } from '@/components/ui/Banner';

export const metadata = {
  title: 'Blog | Handy Experts',
  description: 'Read the latest tips, guides, and news about home improvement and maintenance.',
};

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
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
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Latest Articles</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            We are working on some insightful articles for you. Check back soon for the latest updates and expert tips!
          </p>
        </div>
      </div>
    </div>
  );
}
