import React from "react";
import { redirect } from "next/navigation";
import { VendorLayoutWrapper } from "@/components/vendor/layout/VendorLayoutWrapper";
import { Metadata } from "next";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { isOnboardingComplete } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Vendor Dashboard | Handyzo",
  description: "Manage your technicians, services, and live calls.",
};

export default async function VendorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getOnboardingStatus();
  if (status && !isOnboardingComplete(status)) {
    redirect("/onboarding");
  }

  return <VendorLayoutWrapper>{children}</VendorLayoutWrapper>;
}
