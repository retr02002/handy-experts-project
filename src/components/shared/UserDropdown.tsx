"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function UserDropdown() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const userEmail = session.user?.email || "";
  const userName = session.user?.name || userEmail.split("@")[0] || "User";
  const userImage = session.user?.image;
  const avatarInitial = userName.charAt(0).toUpperCase() || "U";
  
  const userRole = session.user?.role || "CUSTOMER";

  const getDashboardPath = () => {
    switch (userRole) {
      case "SUPER_ADMIN": return "/admin";
      case "VENDOR": return "/vendor";
      case "TECHNICIAN": return "/technician";
      case "CUSTOMER":
      default: return "/customer";
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <div className="relative" ref={profileRef}>
      <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 outline-none">
        <div className="w-8 h-8 rounded-full bg-[#00B4FF] flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent hover:ring-[#0096fa] transition-all overflow-hidden relative">
          {userImage ? (
            <Image 
              src={userImage} 
              alt={userName} 
              fill 
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span>{avatarInitial}</span>
          )}
        </div>
      </button>
      
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
          </div>
          <div className="p-1">
            <Link 
              href={dashboardPath} 
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ClientIcon icon="ph:squares-four" className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              href={`${dashboardPath}/profile`} 
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ClientIcon icon="ph:user" className="w-4 h-4" />
              Profile
            </Link>
            
            {userRole === "VENDOR" && (
              <Link 
                href="/vendor/settings" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ClientIcon icon="ph:gear" className="w-4 h-4" />
                Settings
              </Link>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
            <button 
              onClick={() => {
                setIsProfileOpen(false);
                signOut({ callbackUrl: "/sign-in" });
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
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
