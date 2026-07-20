import React from 'react';
import { mockAvailableServices } from '@/lib/mockData';
import { ServiceSelector } from '../client/ServiceSelector';

interface ServicesStepProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ServicesStep({ searchParams }: ServicesStepProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">What do you need help with?</h2>
        <p className="text-slate-500 dark:text-slate-400">Select one or more services to proceed.</p>
      </div>

      <ServiceSelector services={mockAvailableServices} />
    </div>
  );
}
