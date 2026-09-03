"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CustomerDetailsStep } from "@/components/onboarding/CustomerDetailsStep";

export function CustomerProfileGate({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const router = useRouter();
  const { update } = useSession();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#060B14]">
      <div className="w-full max-w-md bg-white dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85dvh]">
        <CustomerDetailsStep
          initialName={initialName}
          initialPhone={initialPhone}
          onSuccess={async () => {
            await update();
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
