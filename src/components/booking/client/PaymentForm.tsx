'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientIcon } from '@/components/ui/ClientIcon';

export function PaymentForm() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      router.replace('?step=success');
    }, 2000);
  };

  return (
    <div>
      <div className="mb-2 w-full">
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-[0.98]"
        >
          {isProcessing ? (
            <>
              <ClientIcon icon="ph:spinner" className="animate-spin text-xl" />
              Processing...
            </>
          ) : (
            <>
              <ClientIcon icon="ph:lock-key" />
              Confirm Booking & Pay
            </>
          )}
        </button>
      </div>
      <p className="text-center text-xs text-slate-500 mt-3">
        Your payment is securely processed. We don&apos;t store your card details.
      </p>
    </div>
  );
}
