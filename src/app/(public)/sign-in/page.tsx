import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Handy Experts",
  description: "Sign in to your Handy Experts account.",
};

export default function SignInPage() {
  return (
    <AuthLayout badgeText="Welcome back">
      <SignInForm />
    </AuthLayout>
  );
}
