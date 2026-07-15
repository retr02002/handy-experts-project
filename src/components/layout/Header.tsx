import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function Header() {
  return (
    <>
      <div className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
        <header
          id="main-header"
          suppressHydrationWarning
          className="w-full max-w-7xl transition-all duration-300 rounded-full border pointer-events-auto backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-sm"
        >
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">

              {/* Left: Navigation */}
              <div className="flex-1 flex items-center justify-start">
                <nav className="hidden lg:flex items-center gap-5 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Services</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">About</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Pricing</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Partners</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Blog</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-2">Contact</Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="flex lg:hidden items-center">
                  <button
                    id="mobile-menu-btn"
                    className="p-1.5 -ml-1.5 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Open menu"
                  >
                    <ClientIcon icon="ph:list" width="24" height="24" />
                  </button>
                </div>
              </div>

              {/* Center: Logo */}
              <div className="flex justify-center items-center shrink-0">
                <Link href="/" className="flex items-center justify-center">
                  <Image
                    src="/logo-org.svg"
                    alt="Handy Experts"
                    width={140}
                    height={50}
                    className="h-8 sm:h-12 w-auto object-contain transition-all duration-300 hover:scale-105 drop-shadow-sm dark:brightness-0 dark:invert"
                    priority
                  />
                </Link>
              </div>

              {/* Right: Actions */}
              <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-3">
                <div className="scale-[0.85] sm:scale-100 origin-right">
                  <ThemeToggle />
                </div>

                <button className="hidden sm:flex p-1.5 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                  <ClientIcon icon="ph:shopping-bag" width="22" height="22" />
                </button>

                <Link href="#" className="hidden md:flex items-center text-[14px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors ml-1">
                  <ClientIcon icon="ph:sign-in" width="18" height="18" className="mr-1" />
                  Sign in
                </Link>

                {/* Mobile Book Icon */}
                <Link href="#" className="flex sm:hidden items-center justify-center rounded-full w-8 h-8 shadow-sm transition-transform active:scale-95 bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <ClientIcon icon="ph:calendar-plus-fill" width="16" height="16" />
                </Link>

                {/* Desktop Book Button */}
                <Link href="#" className="hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2 text-[14px] font-bold shadow-md transition-all hover:scale-105 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 whitespace-nowrap">
                  Book now
                </Link>
              </div>

            </div>
          </div>
        </header>
      </div>

      {/* Mobile Offcanvas Menu */}
      {/* Overlay */}
      <div
        id="mobile-menu-overlay"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden opacity-0 pointer-events-none"
      />

      {/* Side Panel */}
      <div
        id="mobile-menu-panel"
        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl z-[70] shadow-[10px_0_40px_rgba(0,0,0,0.1)] dark:shadow-[10px_0_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out flex flex-col lg:hidden border-r border-slate-200/50 dark:border-white/10 -translate-x-full"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/50">
          <Image
            src="/logo-org.svg"
            alt="Handy Experts"
            width={110}
            height={36}
            className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
          />
          <button
            id="mobile-menu-close"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <ClientIcon icon="ph:x" width="20" height="20" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl transition-all group">
            <ClientIcon icon="ph:wrench" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
            Services
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl transition-all group">
            <ClientIcon icon="ph:info" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
            About
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl transition-all group">
            <ClientIcon icon="ph:currency-circle-dollar" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
            Pricing
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl transition-all group">
            <ClientIcon icon="ph:handshake" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
            Partners
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl transition-all group">
            <ClientIcon icon="ph:article" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
            Blog
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl transition-all group">
            <ClientIcon icon="ph:envelope-simple" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
            Contact
          </Link>

          <div className="my-4 mx-3 border-t border-slate-100 dark:border-slate-800/50" />

          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group">
            <ClientIcon icon="ph:sign-in" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
            Sign in
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group">
            <ClientIcon icon="ph:shopping-bag" width="20" height="20" className="mr-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
            Cart
          </Link>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800/50">
          <Link href="#" className="flex items-center justify-center w-full rounded-xl px-4 py-3 text-[14px] font-semibold shadow-[0_2px_10px_rgba(0,180,255,0.25)] transition-all bg-gradient-to-r from-[#00B4FF] to-[#0070FF] hover:shadow-[0_4px_15px_rgba(0,180,255,0.4)] active:scale-[0.98] text-white">
            Book Service Now
            <ClientIcon icon="ph:arrow-right" className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const header = document.getElementById('main-header');
              const mobileMenuBtn = document.getElementById('mobile-menu-btn');
              const mobileMenuPanel = document.getElementById('mobile-menu-panel');
              const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
              const mobileMenuClose = document.getElementById('mobile-menu-close');

              window.addEventListener('scroll', () => {
                if (window.scrollY > 10) {
                  header.classList.add('bg-white/95', 'dark:bg-slate-900/95', 'border-slate-200/80', 'dark:border-slate-700/80', 'shadow-lg', 'dark:shadow-2xl');
                  header.classList.remove('bg-white/80', 'dark:bg-slate-900/80', 'border-slate-200/50', 'dark:border-slate-700/50', 'shadow-sm');
                } else {
                  header.classList.remove('bg-white/95', 'dark:bg-slate-900/95', 'border-slate-200/80', 'dark:border-slate-700/80', 'shadow-lg', 'dark:shadow-2xl');
                  header.classList.add('bg-white/80', 'dark:bg-slate-900/80', 'border-slate-200/50', 'dark:border-slate-700/50', 'shadow-sm');
                }
              });

              const openMenu = () => {
                mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                mobileMenuOverlay.classList.add('opacity-100', 'pointer-events-auto');
                mobileMenuPanel.classList.remove('-translate-x-full');
                mobileMenuPanel.classList.add('translate-x-0');
                document.body.style.overflow = 'hidden';
              };

              const closeMenu = () => {
                mobileMenuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
                mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
                mobileMenuPanel.classList.remove('translate-x-0');
                mobileMenuPanel.classList.add('-translate-x-full');
                document.body.style.overflow = '';
              };

              mobileMenuBtn?.addEventListener('click', openMenu);
              mobileMenuClose?.addEventListener('click', closeMenu);
              mobileMenuOverlay?.addEventListener('click', closeMenu);
            });
          `,
        }}
      />
    </>
  );
}
