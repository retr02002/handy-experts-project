import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Handy Experts",
  description: "Create your Handy Experts account.",
};

export default function SignUpPage() {
  return (
    <AuthLayout badgeText="Join us">
      <SignUpForm />
    </AuthLayout>
  );
}
