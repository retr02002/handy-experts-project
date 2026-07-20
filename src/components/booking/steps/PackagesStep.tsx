import React from 'react';
import { mockPackages, mockAvailableServices } from '@/lib/mockData';
import { PackageSelector } from '../client/PackageSelector';

interface PackagesStepProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function PackagesStep({ searchParams }: PackagesStepProps) {
  const selectedParam = searchParams.selected;
  const selectedIds = typeof selectedParam === 'string' ? selectedParam.split(',') : [];
  
  const selectedServices = mockAvailableServices.filter(s => selectedIds.includes(s.id));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bundle & Save</h2>
        <p className="text-slate-500 dark:text-slate-400">Choose to bundle your selected services or pick a pre-defined package for better value.</p>
      </div>

      <PackageSelector 
        packages={mockPackages} 
        selectedServices={selectedServices} 
      />
    </div>
  );
}
