'use client';

import React, { useState } from 'react';
import { StepNavigator } from './StepNavigator';
import { ClientIcon } from '@/components/ui/ClientIcon';
import { useRouter, useSearchParams } from 'next/navigation';

export function LocationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [zip, setZip] = useState(searchParams.get('zip') || '');

  const isValid = address.length > 5 && city.length > 2 && zip.length >= 5;

  const handleNext = (params: URLSearchParams) => {
    params.set('address', address);
    params.set('city', city);
    params.set('zip', zip);
    return params;
  };

  return (
    <div>
      <div className="mb-8 w-full">
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
          {/* Street Address */}
          <div className="relative flex items-center px-4 sm:px-5 py-3 sm:py-4 group border-b border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mr-4">
              <ClientIcon icon="ph:map-pin" className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Street Address</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                autoComplete="street-address"
                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 text-sm sm:text-base font-medium truncate focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row">
            {/* City */}
            <div className="relative flex items-center px-4 sm:px-5 py-3 sm:py-4 group border-b sm:border-b-0 sm:border-r border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10 transition-colors flex-1">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mr-4">
                <ClientIcon icon="ph:buildings" className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  autoComplete="address-level2"
                  className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 text-sm sm:text-base font-medium truncate focus:outline-none"
                />
              </div>
            </div>

            {/* ZIP */}
            <div className="relative flex items-center px-4 sm:px-5 py-3 sm:py-4 group bg-white dark:bg-slate-800/60 focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10 transition-colors flex-1">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 mr-4">
                <ClientIcon icon="ph:hash" className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">ZIP Code</label>
                <input 
                  type="text" 
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="10001"
                  autoComplete="postal-code"
                  className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 text-sm sm:text-base font-medium truncate focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <StepNavigator 
        prevStep="packages"
        nextStep="slot"
        isNextDisabled={!isValid}
        onNext={handleNext}
      />
    </div>
  );
}
