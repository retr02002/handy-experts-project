import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";

export default async function CustomerProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const userName = user?.name || "Customer User";
  const userEmail = user?.email || "customer@example.com";
  const avatarInitial = userName.charAt(0).toUpperCase() || "C";
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#00B4FF] flex items-center justify-center text-white font-bold text-3xl ring-4 ring-blue-50 dark:ring-slate-700 overflow-hidden relative">
            {user?.image ? (
              <Image src={user.image} alt={userName} fill className="object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userName}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{userEmail}</p>
            <button className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Referrals Link (Particularly important for mobile where it's not in the bottom nav) */}
      <div className="md:hidden">
        <Link href="/customer/referrals" className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
            <ClientIcon icon="ph:users" className="w-6 h-6" />
            <div>
              <p className="font-semibold">Referrals Program</p>
              <p className="text-xs opacity-80">Refer friends and earn rewards</p>
            </div>
          </div>
          <ClientIcon icon="ph:caret-right" className="w-5 h-5 text-purple-500" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Account Settings</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <span className="text-slate-700 dark:text-slate-300">Addresses</span>
            <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <span className="text-slate-700 dark:text-slate-300">Payment Methods</span>
            <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <span className="text-slate-700 dark:text-slate-300">Security</span>
            <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-rose-600 dark:text-rose-400">
            <span>Log out</span>
            <ClientIcon icon="ph:sign-out" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
