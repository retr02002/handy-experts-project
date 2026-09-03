import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { isOnboardingComplete, dashboardPathForRole } from "@/lib/onboarding";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Complete Your Account - Handyzo",
  description: "Tell us a bit more about you to finish setting up your account.",
};

type SearchParams = Promise<{ role?: string }>;

export default async function OnboardingPage({ searchParams }: { searchParams: SearchParams }) {
  const { role } = await searchParams;
  const status = await getOnboardingStatus();

  if (status) {
    if (isOnboardingComplete(status)) {
      redirect(dashboardPathForRole(status.role));
    }
    // A signed-in PENDING account reaching here with no role= param can only
    // be a Google sign-in from the customer pages now (vendor/technician
    // signup is credentials-first and never leaves this page mid-flow) — send
    // it to the customer dashboard's own profile-completion gate instead of
    // showing the vendor/technician cards.
    if (status.role === "PENDING" && role !== "VENDOR" && role !== "TECHNICIAN") {
      redirect("/customer");
    }
  }

  return (
    <Suspense fallback={null}>
      <OnboardingFlow status={status} />
    </Suspense>
  );
}
