import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const userName = user?.name || "System Admin";
  const userEmail = user?.email || "admin@Handyzo.com";
  const [firstName, ...lastNameParts] = userName.split(" ");
  const lastName = lastNameParts.join(" ") || "";
  const avatarInitial = userName.charAt(0).toUpperCase() || "A";
  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and system preferences</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full sm:w-auto">
          <ClientIcon icon="ph:floppy-disk" className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 dark:from-indigo-500/10 dark:to-purple-500/5"></div>
            
            <div className="relative group mt-8 mb-4">
              <div className="w-28 h-28 rounded-full bg-white dark:bg-[#0B1120] p-1.5 shadow-md border border-slate-100 dark:border-slate-800 relative z-10">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl overflow-hidden relative">
                  {user?.image ? (
                    <Image src={user.image} alt={userName} fill className="object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </div>
              </div>
              <button className="absolute inset-0 m-1.5 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20">
                <ClientIcon icon="ph:camera" className="w-6 h-6" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white relative z-10">{userName}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold relative z-10">
              <ClientIcon icon="ph:shield-star-fill" className="w-3.5 h-3.5" />
              Super Administrator
            </div>
            
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-6 relative z-10"></div>
            
            <div className="w-full space-y-4 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Joined</span>
                <span className="text-slate-900 dark:text-slate-200 font-medium">Jan 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* General Information */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ClientIcon icon="ph:identification-card-fill" className="text-indigo-500 w-5 h-5" />
              Personal Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                <div className="relative">
                  <ClientIcon icon="ph:user" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input 
                    type="text" 
                    defaultValue={firstName}
                    className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                <div className="relative">
                  <ClientIcon icon="ph:user" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input 
                    type="text" 
                    defaultValue={lastName}
                    className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <ClientIcon icon="ph:envelope" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input 
                    type="email" 
                    defaultValue={userEmail}
                    className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security & Preferences Minimal */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ClientIcon icon="ph:lock-key-fill" className="text-slate-500 w-5 h-5" />
              Account Security
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <ClientIcon icon="ph:password" className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">Change Password</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We recommend updating your password regularly</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto">
                Update Password
              </button>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
