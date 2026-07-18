import React from "react";
import { notFound } from "next/navigation";
import { MOCK_BLOGS } from "@/data/mockBlogs";
import { BlogDetailHero } from "@/components/blog/BlogDetailHero";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { BlogActions } from "@/components/blog/BlogActions";
import { BlogComments } from "@/components/blog/BlogComments";
import { BlogCard } from "@/components/blog/BlogCard";
import { Metadata } from "next";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const post = MOCK_BLOGS.find((p) => p.slug === params.slug);
  
  if (!post) {
    return {
      title: "Blog Post Not Found | Handy Experts",
    };
  }

  return {
    title: `${post.title} | Handy Experts Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const post = MOCK_BLOGS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020813]">
      {/* Hero Section */}
      <BlogDetailHero
        title={post.title}
        category={post.category}
        author={post.author}
        date={post.date}
        readTime={post.readTime}
        image={post.image}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20 pt-4 relative">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Article Content & Comments */}
          <main className="flex-1 w-full min-w-0">
            {/* Mobile Actions (Visible only on small screens) */}
            <div className="lg:hidden mb-8">
              <BlogActions />
            </div>

            {/* Article Body */}
            <article className="prose prose-slate dark:prose-invert prose-lg max-w-none 
              prose-headings:font-bold prose-a:text-[#00B4FF] hover:prose-a:text-[#0080FF]
              prose-img:rounded-2xl prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
            />

            {/* Comments Section */}
            <BlogComments />
            
            {/* Related Articles (Simplified for demo) */}
            <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex flex-col">
                  <span className="text-[10px] font-bold text-[#00B4FF] uppercase tracking-widest mb-1">Read More</span>
                  Related Articles
                </h3>
                <Link href="/blog" className="text-sm font-semibold text-slate-500 hover:text-[#00B4FF] flex items-center gap-1 transition-colors">
                  View All
                  <ClientIcon icon="ph:arrow-right-bold" className="w-3 h-3" />
                </Link>
              </div>
              
              {/* Related Articles Grid using BlogCard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {MOCK_BLOGS.filter(p => p.id !== post.id).slice(0, 2).map(related => (
                  <BlogCard key={related.id} post={related} />
                ))}
              </div>
            </div>
          </main>

          {/* Right Column: Sidebar */}
          <aside className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-28 flex flex-col gap-8 z-10">
            {/* Desktop Actions (Hidden on small screens) */}
            <div className="hidden lg:block">
              <BlogActions />
            </div>

            <BlogSidebar
              author={post.author}
              authorDescription={post.authorDescription}
              tags={post.tags}
            />
          </aside>

        </div>
      </div>
    </div>
  );
}
