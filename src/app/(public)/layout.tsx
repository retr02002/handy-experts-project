import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatBot } from "@/components/ui/ChatBot";
import { getAllCategories } from "@/lib/services-data";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Footer is a client component, so its category links are fetched here.
  const categories = await getAllCategories();

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer categories={categories} />
      <ChatBot />
    </>
  );
}
