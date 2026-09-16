"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { logoutPathForRole } from "@/lib/onboarding";

export function LogoutMenuItem() {
  const { data: session } = useSession();

  return (
    <button
      onClick={() => signOut({ callbackUrl: logoutPathForRole(session?.user?.role) })}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-rose-600 dark:text-rose-400 cursor-pointer"
    >
      <span className="text-sm font-semibold">Log out</span>
      <ClientIcon icon="ph:sign-out" className="w-4 h-4" />
    </button>
  );
}
