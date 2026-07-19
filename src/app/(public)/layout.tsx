import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatBot } from "@/components/ui/ChatBot";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <ChatBot />
    </>
  );
}
