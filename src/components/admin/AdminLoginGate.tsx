"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getUserRole } from "@/actions/auth.actions";

export function AdminLoginGate() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", { redirect: false, identifier: email, password });

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      const role = await getUserRole();
      if (role !== "SUPER_ADMIN") {
        await signOut({ redirect: false });
        setError("This account doesn't have admin access.");
        return;
      }

      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex px-4 py-12 bg-slate-950 overflow-y-auto">
      <div className="w-full max-w-sm m-auto bg-white dark:bg-[#0A101D] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white shadow-md mb-3">
            <ClientIcon icon="ph:shield-check-fill" className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">Admin sign in</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">Authorized personnel only.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <ClientIcon icon="ph:envelope-simple" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="admin@handyzo.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <ClientIcon icon="ph:lock" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-10 text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <ClientIcon icon={showPassword ? "ph:eye-slash" : "ph:eye"} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:opacity-70 text-white dark:text-slate-900 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
