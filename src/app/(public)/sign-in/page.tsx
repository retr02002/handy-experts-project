import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Handyzo",
  description: "Sign in to your Handyzo account.",
};

export default function SignInPage() {
  return (
    <AuthLayout badgeText="Welcome back">
      <SignInForm />
    </AuthLayout>
  );
}
