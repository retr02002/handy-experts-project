import React from 'react';
import { LocationForm } from '../client/LocationForm';

interface LocationStepProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function LocationStep({ searchParams }: LocationStepProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Where do you need service?</h2>
        <p className="text-slate-500 dark:text-slate-400">Enter your address so we can match you with local experts.</p>
      </div>

      <LocationForm />
    </div>
  );
}
