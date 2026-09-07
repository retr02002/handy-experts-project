"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";

/**
 * Replaces the old "Book" bottom-nav item. Signed out, it's just a link to
 * sign-in like the desktop header's own sign-in link; signed in, it opens an
 * upward sheet with the same option set as the desktop UserDropdown (that
 * one opens downward from the header, so it can't be reused as-is here).
 */
export function MobileAccountNavButton() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) {
    return (
      <Link
        href="/sign-in"
        className={`group flex flex-col items-center justify-center w-full h-full relative transition-colors ${
          pathname === "/sign-in" ? "text-[#00B4FF]" : "text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]"
        }`}
      >
        <div className="relative flex flex-col items-center justify-center h-full space-y-1 w-full">
          <ClientIcon icon="ph:sign-in" className={`w-6 h-6 transition-all duration-300 group-hover:-translate-y-1 group-active:scale-90 ${pathname === "/sign-in" ? 'scale-110 drop-shadow-[0_2px_8px_rgba(0,180,255,0.4)]' : ''}`} />
          <span className={`text-[11px] font-medium leading-none mt-0.5 transition-all duration-300 ${pathname === "/sign-in" ? 'translate-y-0' : 'group-hover:translate-y-0.5'}`}>Login</span>
          {pathname === "/sign-in" && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00B4FF] shadow-[0_0_8px_rgba(0,180,255,0.8)] animate-in fade-in slide-in-from-bottom-1" />
          )}
        </div>
      </Link>
    );
  }

  const userEmail = session.user?.email || "";
  const userName = session.user?.name || userEmail.split("@")[0] || "User";
  const userImage = session.user?.image;
  const avatarInitial = userName.charAt(0).toUpperCase() || "U";
  const userRole = session.user?.role || "CUSTOMER";

  const dashboardPath =
    userRole === "SUPER_ADMIN" ? "/admin" : userRole === "VENDOR" ? "/vendor" : userRole === "TECHNICIAN" ? "/technician" : "/customer";
  const isActive = pathname.startsWith(dashboardPath);

  return (
    <div className="relative w-full h-full" ref={menuRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`group flex flex-col items-center justify-center w-full h-full relative transition-colors cursor-pointer ${
          isActive || isOpen ? "text-[#00B4FF]" : "text-slate-500 hover:text-[#00B4FF] dark:text-slate-400 dark:hover:text-[#00B4FF]"
        }`}
      >
        <div className="relative flex flex-col items-center justify-center h-full space-y-1 w-full">
          <div
            className={`w-6 h-6 rounded-full overflow-hidden relative flex items-center justify-center shrink-0 transition-all duration-300 group-hover:-translate-y-1 group-active:scale-90 ${
              isActive || isOpen ? "ring-2 ring-[#00B4FF] ring-offset-1 dark:ring-offset-[#0B1120] scale-110 drop-shadow-[0_2px_8px_rgba(0,180,255,0.4)]" : "ring-2 ring-transparent"
            } ${userImage ? "" : "bg-[#00B4FF] text-white"}`}
          >
            {userImage ? (
              <Image src={userImage} alt={userName} fill sizes="24px" className="object-cover" />
            ) : (
              <span className="text-[10px] font-bold leading-none">{avatarInitial}</span>
            )}
          </div>
          <span className={`text-[11px] font-medium leading-none mt-0.5 transition-all duration-300 ${isActive || isOpen ? 'translate-y-0' : 'group-hover:translate-y-0.5'}`}>Account</span>
          {(isActive || isOpen) && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00B4FF] shadow-[0_0_8px_rgba(0,180,255,0.8)] animate-in fade-in slide-in-from-bottom-1" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
          </div>
          <div className="p-1">
            <Link
              href={dashboardPath}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ClientIcon icon="ph:squares-four" className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href={`${dashboardPath}/profile`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ClientIcon icon="ph:user" className="w-4 h-4" />
              Profile
            </Link>

            {userRole === "VENDOR" && (
              <Link
                href="/vendor/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ClientIcon icon="ph:gear" className="w-4 h-4" />
                Settings
              </Link>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/sign-in" });
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <ClientIcon icon="ph:sign-out" className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
