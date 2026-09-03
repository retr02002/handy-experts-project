import React from "react";
import { Metadata } from "next";
import { CustomerLayoutWrapper } from "@/components/customer/layout/CustomerLayoutWrapper";
import { CustomerProfileGate } from "@/components/customer/CustomerProfileGate";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { isOnboardingComplete } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Customer Portal | Handyzo",
  description: "Customer portal for Handyzo",
};

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  // Catches the case proxy.ts can't: an existing CUSTOMER account (role
  // already set) that's still missing a name — e.g. a fresh OTP or Google
  // sign-in. Prompt for it right here instead of bouncing away to
  // /onboarding. Phone is already verified/set for OTP customers by this
  // point, so it's passed through and hidden rather than re-collected.
  const status = await getOnboardingStatus();
  if (status && !isOnboardingComplete(status)) {
    return <CustomerProfileGate initialName={status.name ?? ""} initialPhone={status.phone ?? ""} />;
  }

  return <CustomerLayoutWrapper>{children}</CustomerLayoutWrapper>;
}
