import React from 'react';
import { mockPackages, mockAvailableServices } from '@/lib/mockData';
import { PaymentForm } from '../client/PaymentForm';
import { StepNavigator } from '../client/StepNavigator';
import { ClientIcon } from '@/components/ui/ClientIcon';

interface ReceiptStepProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ReceiptStep({ searchParams }: ReceiptStepProps) {
  const packageId = searchParams.packageId as string | undefined;
  const customBundle = searchParams.customBundle === 'true';
  const selectedParam = searchParams.selected;
  const selectedIds = typeof selectedParam === 'string' ? selectedParam.split(',') : [];

  let subtotal = 0;
  let discount = 0;
  let itemName = '';
  let itemDescription = '';

  if (packageId) {
    const pkg = mockPackages.find(p => p.id === packageId);
    if (pkg) {
      subtotal = pkg.price;
      itemName = pkg.name;
      itemDescription = pkg.description;
    }
  } else if (customBundle || selectedIds.length > 0) {
    const selectedServices = mockAvailableServices.filter(s => selectedIds.includes(s.id));
    const basePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const hasDiscount = customBundle && selectedServices.length > 1;
    
    itemName = customBundle ? 'Custom Bundle' : 'Selected Services';
    itemDescription = selectedServices.map(s => s.name).join(', ');
    
    if (hasDiscount) {
      discount = basePrice * 0.10; // 10% discount for custom bundle
    }
    subtotal = basePrice;
  }

  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + tax;

  const date = (searchParams.date as string) || 'Date Not Selected';
  const time = (searchParams.time as string) || 'Time Not Selected';
  const address = (searchParams.address as string) || 'Address Not Selected';
  const city = (searchParams.city as string) || 'City Not Selected';

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Review & Pay</h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Please review your booking details and complete the payment.</p>
      </div>

      <div className="space-y-8">
        {/* Receipt Card */}
        <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700/50 relative overflow-hidden">
          {/* Decorative dash line for receipt look */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNjYmQ1ZTEiLz48L3N2Zz4=')] opacity-50 dark:opacity-20" />
          
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Order Summary</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ClientIcon icon="ph:calendar-blank" className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{date}</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{time}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-800/20">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ClientIcon icon="ph:map-pin" className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-1">{address}</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{city}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{itemName}</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-[200px] sm:max-w-sm line-clamp-2 leading-relaxed">{itemDescription}</p>
            </div>
            <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">${subtotal.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-5 space-y-3 text-xs sm:text-sm font-medium">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 -mx-2 px-2 py-1 rounded-lg">
                <span>Bundle Discount (10%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Taxes & Fees (8%)</span>
              <span className="text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-5 mt-2 border-t border-slate-100 dark:border-slate-700/50">
              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider">Total</span>
              <span className="font-black text-2xl sm:text-3xl text-blue-600 dark:text-blue-500">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-2">
          <PaymentForm />
        </div>

        <StepNavigator prevStep="details" nextStep="" />
      </div>
    </div>
  );
}
