"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function TechnicianProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and preferences.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isEditing 
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:shadow-lg" 
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm"
          }`}
        >
          <ClientIcon icon={isEditing ? "ph:floppy-disk" : "ph:pencil-simple"} className="w-4 h-4" />
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Banner & Avatar section */}
        <div className="relative h-40 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-white dark:bg-[#0F172A] p-1.5 shadow-lg">
                <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative group">
                  <ClientIcon icon="ph:user" className="w-12 h-12 text-slate-400" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                      <ClientIcon icon="ph:camera" className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0F172A]" title="Active Status"></div>
            </div>
          </div>
        </div>

        {/* Profile Info Form */}
        <div className="pt-24 pb-8 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Personal Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ClientIcon icon="ph:identification-card" className="w-4 h-4 text-amber-500" />
                Personal Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="John Doe" 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="john@handyexperts.com" 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567" 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-6 mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ClientIcon icon="ph:briefcase" className="w-4 h-4 text-amber-500" />
                Professional Info
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Primary Skill</label>
                  <select 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all appearance-none"
                    defaultValue="plumbing"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="general">General Handyman</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Service Area (ZIP Code)</label>
                  <input 
                    type="text" 
                    defaultValue="90210" 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Years of Experience</label>
                  <input 
                    type="number" 
                    defaultValue="5" 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
