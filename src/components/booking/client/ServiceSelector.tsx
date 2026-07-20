'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AvailableService } from '@/lib/mockData';
import { StepNavigator } from './StepNavigator';
import { ClientIcon } from '@/components/ui/ClientIcon';

interface ServiceSelectorProps {
  services: AvailableService[];
}

export function ServiceSelector({ services }: ServiceSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedParam = searchParams.get('selected');
  const selectedIds = selectedParam ? selectedParam.split(',') : [];

  const toggleService = (id: string) => {
    let newSelected = [...selectedIds];
    if (newSelected.includes(id)) {
      newSelected = newSelected.filter(sId => sId !== id);
    } else {
      newSelected.push(id);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (newSelected.length > 0) {
      params.set('selected', newSelected.join(','));
    } else {
      params.delete('selected');
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 w-full">
        {services.map((service) => {
          const isSelected = selectedIds.includes(service.id);
          return (
            <div 
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`relative group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
              }`}
            >
              <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 ${
                isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:text-blue-500'
              }`}>
                <ClientIcon icon={service.icon} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white truncate pr-2">{service.name}</h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white scale-110' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                  }`}>
                    {isSelected && <ClientIcon icon="ph:check-bold" className="text-[10px]" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{service.description}</p>
                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">${service.price}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    <ClientIcon icon="ph:clock" /> {service.duration}
                  </span>
                </div>
              </div>
            </div>

          );
        })}
      </div>

      <StepNavigator 
        nextStep="packages" 
        isNextDisabled={selectedIds.length === 0}
      />
    </div>
  );
}
