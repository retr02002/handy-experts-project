'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepNavigator } from './StepNavigator';
import { ClientIcon } from '@/components/ui/ClientIcon';

export function DetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState(searchParams.get('name') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [notes, setNotes] = useState(searchParams.get('notes') || '');

  const isValid = name.length > 2 && email.includes('@') && phone.length >= 10;

  const handleNext = (params: URLSearchParams) => {
    params.set('name', name);
    params.set('email', email);
    params.set('phone', phone);
    if (notes) params.set('notes', notes);
    return params;
  };

  return (
    <div>
      <div className="mb-8 w-full">
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
          {/* Full Name */}
          <div className="relative flex items-center px-4 sm:px-5 py-3 sm:py-4 group border-b border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mr-4">
              <ClientIcon icon="ph:user" className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 text-sm sm:text-base font-medium truncate focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row">
            {/* Email */}
            <div className="relative flex items-center px-4 sm:px-5 py-3 sm:py-4 group border-b sm:border-b-0 sm:border-r border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10 transition-colors flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mr-4">
                <ClientIcon icon="ph:envelope" className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  autoComplete="email"
                  className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 text-sm sm:text-base font-medium truncate focus:outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative flex items-center px-4 sm:px-5 py-3 sm:py-4 group border-b border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10 transition-colors flex-1">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mr-4">
                <ClientIcon icon="ph:phone" className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 text-sm sm:text-base font-medium truncate focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="relative flex items-start px-4 sm:px-5 py-3 sm:py-4 group bg-white dark:bg-slate-800/60 focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mr-4 mt-1">
              <ClientIcon icon="ph:note-pencil" className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Additional Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions..."
                rows={3}
                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 text-sm sm:text-base font-medium resize-none focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <StepNavigator 
        prevStep="slot"
        nextStep="receipt"
        isNextDisabled={!isValid}
        onNext={handleNext}
      />
    </div>
  );
}
