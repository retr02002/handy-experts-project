'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ClientIcon } from '@/components/ui/ClientIcon';

interface StepNavigatorProps {
  nextStep?: string;
  prevStep?: string;
  nextLabel?: string;
  isNextDisabled?: boolean;
  onNext?: (params: URLSearchParams) => URLSearchParams | void;
}

export function StepNavigator({
  nextStep,
  prevStep,
  nextLabel = 'Next Step',
  isNextDisabled = false,
  onNext
}: StepNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    let params = new URLSearchParams(searchParams.toString());
    
    if (onNext) {
      const result = onNext(params);
      if (result) {
        params = result;
      }
    }
    
    if (nextStep) {
      params.set('step', nextStep);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }
  };

  const handlePrev = () => {
    if (prevStep) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', prevStep);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }
  };

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
      {prevStep ? (
        <button
          onClick={handlePrev}
          disabled={isPending}
          className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm sm:text-base flex items-center gap-2"
        >
          <ClientIcon icon="ph:arrow-left-bold" /> Back
        </button>
      ) : (
        <div /> // Placeholder to push Next button to right
      )}
      
      {nextStep && (
        <button
          onClick={handleNext}
          disabled={isNextDisabled || isPending}
          className="px-6 sm:px-8 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30 text-sm sm:text-base"
        >
          {isPending ? 'Loading...' : nextLabel}
          {!isPending && <ClientIcon icon="ph:arrow-right-bold" />}
        </button>
      )}
    </div>
  );
}
