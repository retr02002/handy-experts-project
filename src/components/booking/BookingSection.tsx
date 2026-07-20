import React from 'react';
import { ServicesStep } from './steps/ServicesStep';
import { PackagesStep } from './steps/PackagesStep';
import { ClientIcon } from '@/components/ui/ClientIcon';
import { LocationStep } from './steps/LocationStep';
import { SlotStep } from './steps/SlotStep';
import { DetailsStep } from './steps/DetailsStep';
import { ReceiptStep } from './steps/ReceiptStep';
import { SuccessStep } from './steps/SuccessStep';

interface BookingSectionProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function BookingSection({ searchParams }: BookingSectionProps) {
  const step = typeof searchParams.step === 'string' ? searchParams.step : 'services';

  // Progress tracker
  const steps = [
    { id: 'services', label: 'Services' },
    { id: 'packages', label: 'Packages' },
    { id: 'location', label: 'Location' },
    { id: 'slot', label: 'Time' },
    { id: 'details', label: 'Details' },
    { id: 'receipt', label: 'Payment' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const showProgress = step !== 'success';

  return (
    <div className="w-full max-w-3xl mx-auto">
      {showProgress && (
        <div className="mb-6 sm:mb-8">
          {/* Mobile Progress Tracker */}
          <div className="sm:hidden flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {steps[currentStepIndex].label}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop Progress Tracker */}
          <div className="hidden sm:flex items-center justify-between relative px-2 sm:px-0">
            {/* Background line */}
            <div className="absolute left-0 top-5 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-10" />

            {/* Progress line */}
            <div
              className="absolute left-0 top-5 h-1 bg-blue-600 rounded-full transition-all duration-500 ease-out -z-10"
              style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s, index) => {
              const isCompleted = currentStepIndex > index;
              const isCurrent = currentStepIndex === index;
              return (
                <div key={s.id} className="flex flex-col items-center group relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                      ${isCompleted ? 'bg-blue-600 text-white scale-95' :
                        isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50 scale-110' :
                          'bg-white text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-2 border-slate-100 dark:border-slate-700'}
                    `}
                  >
                    {isCompleted ? <ClientIcon icon="ph:check-bold" className="text-lg" /> : index + 1}
                  </div>
                  {/* Label */}
                  <span className={`absolute -bottom-6 whitespace-nowrap text-xs font-semibold transition-colors duration-300 ${isCurrent ? 'text-blue-600 dark:text-blue-400' :
                      isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 opacity-0 md:opacity-100'
                    }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] min-h-[400px]">
        {step === 'services' && <ServicesStep searchParams={searchParams} />}
        {step === 'packages' && <PackagesStep searchParams={searchParams} />}
        {step === 'location' && <LocationStep searchParams={searchParams} />}
        {step === 'slot' && <SlotStep searchParams={searchParams} />}
        {step === 'details' && <DetailsStep searchParams={searchParams} />}
        {step === 'receipt' && <ReceiptStep searchParams={searchParams} />}
        {step === 'success' && <SuccessStep />}
      </div>
    </div>
  );
}
