import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/context/CartContext";
import { ChatProvider } from "@/context/ChatContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Handy Experts - Professional Home Services",
  description: "Your trusted partner for home maintenance, professional cleaning, high-quality repairs, and everyday essential services. Book trusted pros today.",
  keywords: "home services, cleaning, plumbing, appliance repair, handy experts, carpenters, electricians, professional repairs",
  openGraph: {
    title: "Handy Experts - Professional Home Services",
    description: "Your trusted partner for home maintenance, professional cleaning, high-quality repairs, and everyday essential services.",
    url: "https://handyexperts.com",
    siteName: "Handy Experts",
    images: [
      {
        url: "/logo-org.svg", // Replace with a high-res OG image in production
        width: 1200,
        height: 630,
        alt: "Handy Experts - Professional Home Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handy Experts - Professional Home Services",
    description: "Your trusted partner for home maintenance, professional cleaning, high-quality repairs, and everyday essential services.",
    images: ["/logo-org.svg"],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-24 lg:pb-0">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CartProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

