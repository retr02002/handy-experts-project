'use client';

import React from 'react';
import Link from 'next/link';
import { ClientIcon } from '@/components/ui/ClientIcon';

export function SuccessStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <ClientIcon icon="ph:check-circle-fill" className="text-6xl" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Booking Confirmed!</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
        Thank you for choosing Handyzo. Your appointment has been successfully scheduled. We&apos;ve sent a confirmation email with the details.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="px-8 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
          Return Home
        </Link>
        <button 
          onClick={() => window.location.href = '/book-now'}
          className="px-8 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Book Another Service
        </button>
      </div>
    </div>
  );
}
