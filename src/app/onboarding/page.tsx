import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { isOnboardingComplete, dashboardPathForRole } from "@/lib/onboarding";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Complete Your Account - Handyzo",
  description: "Tell us a bit more about you to finish setting up your account.",
};

export default async function OnboardingPage() {
  const status = await getOnboardingStatus();
  if (!status) redirect("/sign-in");

  if (isOnboardingComplete(status)) {
    redirect(dashboardPathForRole(status.role));
  }

  return <OnboardingFlow status={status} />;
}
