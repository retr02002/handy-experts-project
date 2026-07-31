import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomerLayoutWrapper } from "@/components/customer/layout/CustomerLayoutWrapper";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { isOnboardingComplete } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Customer Portal | Handyzo",
  description: "Customer portal for Handyzo",
};

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  // Catches the case proxy.ts can't: an existing CUSTOMER account (role
  // already set) that's still missing name/phone, e.g. never finished
  // onboarding after a prior partial signup.
  const status = await getOnboardingStatus();
  if (status && !isOnboardingComplete(status)) {
    redirect("/onboarding");
  }

  return <CustomerLayoutWrapper>{children}</CustomerLayoutWrapper>;
}
