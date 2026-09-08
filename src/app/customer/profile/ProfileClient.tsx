"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { LogoutMenuItem } from "@/components/shared/LogoutMenuItem";
import { EditProfileModal } from "@/components/customer/profile/EditProfileModal";

interface ProfileProps {
  profile: {
    name: string | null;
    email: string | null;
    phone?: string | null;
    hasPassword: boolean;
    hasGoogleAccount: boolean;
    image?: string | null;
  };
}

export function ProfileClient({ profile }: ProfileProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userName = profile.name || "Customer";
  const avatarInitial = userName.charAt(0).toUpperCase() || "C";

  return (
    <div className="pb-6 -mt-4 md:-mt-6 mx-[-16px] md:mx-[-24px]">
      {/* Top Gradient Header Area */}
      <div className="bg-gradient-to-b from-[#00B4FF] to-[#0096d6] dark:from-[#005a80] dark:to-[#00B4FF] pt-6 pb-12 px-4 md:px-5 rounded-b-[24px] md:rounded-b-[32px] shadow-lg relative">
        <div className="max-w-2xl mx-auto flex items-center gap-3 md:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center text-[#00B4FF] font-bold text-xl sm:text-2xl ring-4 ring-white/30 overflow-hidden relative shrink-0 shadow-xl">
            {profile.image ? (
              <Image src={profile.image} alt={userName} fill className="object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
          <div className="flex flex-col text-white">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{userName}</h1>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mt-2 text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors py-1 px-3 rounded-full self-start flex items-center gap-1.5"
            >
              <ClientIcon icon="ph:pencil-simple" className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 md:-mt-8 space-y-3 md:space-y-4">
        {/* Quick Actions (3 Cards) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-3 sm:p-4 flex justify-between sm:justify-around relative z-10">
          <Link href="/customer/orders" className="flex flex-col items-center gap-1.5 group w-1/3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#00B4FF]/10 group-hover:text-[#00B4FF] transition-colors">
              <ClientIcon icon="ph:receipt" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">My Orders</span>
          </Link>
          
          <Link href="/customer/bills" className="flex flex-col items-center gap-1.5 group w-1/3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#00B4FF]/10 group-hover:text-[#00B4FF] transition-colors">
              <ClientIcon icon="ph:invoice" className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">My Bills</span>
          </Link>

          <Link href="/customer/reviews" className="flex flex-col items-center gap-1.5 group w-1/3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#00B4FF]/10 group-hover:text-[#00B4FF] transition-colors">
              <ClientIcon icon="ph:star" className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">My Reviews</span>
          </Link>
        </div>

        {/* List Links */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            <Link href="/customer/rewards" className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 bg-orange-50 dark:bg-orange-500/20 text-orange-500 rounded-xl relative">
                  <ClientIcon icon="ph:gift" className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Rewards</span>
              </div>
              <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </Link>
            
            <Link href="/customer/addresses" className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/20 text-blue-500 rounded-xl">
                  <ClientIcon icon="ph:map-pin" className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Saved Addresses</span>
              </div>
              <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </Link>

            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500 rounded-xl">
                  <ClientIcon icon="ph:credit-card" className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Payment Methods</span>
              </div>
              <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </button>

            <div className="pt-2 pb-2">
              <LogoutMenuItem />
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}
