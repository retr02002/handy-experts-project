import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatBotLazy } from "@/components/layout/ChatBotLazy";
import { getAllCategories } from "@/lib/services-data";

// Split out so only the footer's data dependency is behind Suspense — Header
// and {children} (the actual page) no longer wait on this fetch. Previously
// PublicLayout itself awaited getAllCategories() before rendering anything,
// which blocked every single public-route navigation behind one Prisma call.
async function FooterWithCategories() {
  const categories = await getAllCategories();
  return <Footer categories={categories} />;
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Suspense fallback={<div className="h-[400px]" />}>
        <FooterWithCategories />
      </Suspense>
      <ChatBotLazy />
    </>
  );
}
