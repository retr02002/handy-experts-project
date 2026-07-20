'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, AvailableService } from '@/lib/mockData';
import { StepNavigator } from './StepNavigator';
import { ClientIcon } from '@/components/ui/ClientIcon';

interface PackageSelectorProps {
  packages: Package[];
  selectedServices: AvailableService[];
}

export function PackageSelector({ packages, selectedServices }: PackageSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedPackageId = searchParams.get('packageId');
  const customBundleSelected = searchParams.get('customBundle') === 'true';

  const selectPackage = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('packageId', id);
    params.delete('customBundle');
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  const selectCustomBundle = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('customBundle', 'true');
    params.delete('packageId');
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  const customBundlePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const customBundleDiscount = selectedServices.length > 1 ? 10 : 0; // 10% off for 2+ services
  const customBundleTotal = customBundlePrice * (1 - customBundleDiscount / 100);

  return (
    <div>
      {selectedServices.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Your Custom Bundle</h3>
          <div 
            onClick={selectCustomBundle}
            className={`relative group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 ${
              customBundleSelected 
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10' 
                : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
            }`}
          >
            <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 ${
              customBundleSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400 group-hover:text-blue-500'
            }`}>
              <ClientIcon icon="ph:package" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-base text-slate-900 dark:text-white tracking-tight truncate pr-2">
                  Custom Selection
                </h4>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                  customBundleSelected ? 'bg-blue-600 border-blue-600 text-white scale-110' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                }`}>
                  {customBundleSelected && <ClientIcon icon="ph:check-bold" className="text-[10px]" />}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                {selectedServices.map(s => s.name).join(', ')}
              </p>
              
              <div className="flex justify-between items-center font-semibold mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">${customBundleTotal.toFixed(2)}</span>
                  {customBundleDiscount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 uppercase tracking-wider">
                      Save {customBundleDiscount}%
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ClientIcon icon="ph:layers" /> {selectedServices.length} items
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Pre-defined Packages</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 w-full">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          return (
            <div 
              key={pkg.id}
              onClick={() => selectPackage(pkg.id)}
              className={`relative group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
              }`}
            >
              <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 ${
                isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-500 dark:text-purple-400 group-hover:text-blue-500'
              }`}>
                <ClientIcon icon="ph:stack" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight truncate pr-2">{pkg.name}</h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white scale-110' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                  }`}>
                    {isSelected && <ClientIcon icon="ph:check-bold" className="text-[10px]" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">{pkg.description}</p>
                
                <div className="flex justify-between items-center font-semibold mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">${pkg.price}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 uppercase tracking-wider">
                      {pkg.discountPercentage}% OFF
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ClientIcon icon="ph:layers" /> {pkg.services.length} items
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <StepNavigator 
        prevStep="services"
        nextStep="location"
        isNextDisabled={!selectedPackageId && !customBundleSelected}
      />
    </div>
  );
}
