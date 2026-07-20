import React from 'react';
import { DetailsForm } from '../client/DetailsForm';

interface DetailsStepProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function DetailsStep({ searchParams }: DetailsStepProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Details</h2>
        <p className="text-slate-500 dark:text-slate-400">Tell us a bit about yourself so we can confirm your booking.</p>
      </div>

      <DetailsForm />
    </div>
  );
}
