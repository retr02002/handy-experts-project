import React from "react";
import { redirect } from "next/navigation";
import { TechnicianLayoutWrapper } from "@/components/technician/layout/TechnicianLayoutWrapper";
import { Metadata } from "next";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { isOnboardingComplete } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Technician Dashboard | Handyzo",
  description: "Technician portal for Handyzo",
};

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getOnboardingStatus();
  if (status && !isOnboardingComplete(status)) {
    redirect("/onboarding");
  }

  return <TechnicianLayoutWrapper>{children}</TechnicianLayoutWrapper>;
}
