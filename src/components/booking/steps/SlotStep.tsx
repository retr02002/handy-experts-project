import React from 'react';
import { SlotPicker } from '../client/SlotPicker';

interface SlotStepProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function SlotStep({ searchParams }: SlotStepProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">When should we come?</h2>
        <p className="text-slate-500 dark:text-slate-400">Pick a convenient date and time for your service.</p>
      </div>

      <SlotPicker />
    </div>
  );
}
