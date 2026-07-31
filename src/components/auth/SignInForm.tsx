"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getUserRole } from "@/actions/auth.actions";

export function SignInForm() {
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

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      const userRole = await getUserRole();
      const targetPath = userRole === "TECHNICIAN" ? "/technician"
        : userRole === "VENDOR" ? "/vendor"
          : userRole === "SUPER_ADMIN" ? "/admin"
            : "/customer";

      router.push(targetPath);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Sign in</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">Continue to your HandyExperts account</p>
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        type="button"
        className="w-full flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2 text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-5 shadow-sm"
      >
        <ClientIcon icon="logos:google-icon" className="w-4 h-4" />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
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
              placeholder="you@homedelhi.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-all"
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
              className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-all"
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
          className="mt-1 w-full bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white rounded-lg py-2 text-[12px] font-bold flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-slate-500 dark:text-slate-400">
        New here? <Link href="/sign-up" className="text-[#00B4FF] font-bold hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
