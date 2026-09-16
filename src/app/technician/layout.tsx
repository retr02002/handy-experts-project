import React from "react";
import { redirect } from "next/navigation";
import { TechnicianLayoutWrapper } from "@/components/technician/layout/TechnicianLayoutWrapper";
import { Metadata } from "next";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { isOnboardingComplete } from "@/lib/onboarding";
import { hasTechnicianPhotoAction, hasTechnicianCityAction } from "@/actions/kyc.actions";

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

  // City gate runs before the photo gate — a one-tap dropdown is a lighter
  // ask than a camera-permission prompt, so clear the cheaper step first.
  // Both apply to every technician missing the field — a freshly
  // vendor-created account (which skips /onboarding entirely, since
  // createTechnicianAction creates a complete TechnicianProfile upfront)
  // and any pre-existing technician who predates these fields. Each clears
  // permanently once its underlying data exists.
  if (status?.role === "TECHNICIAN") {
    const cityStatus = await hasTechnicianCityAction();
    if (cityStatus.success && !cityStatus.data?.hasCity) {
      redirect("/select-city");
    }

    const photo = await hasTechnicianPhotoAction();
    if (photo.success && !photo.data?.hasPhoto) {
      redirect("/capture-photo");
    }
  }

  return <TechnicianLayoutWrapper>{children}</TechnicianLayoutWrapper>;
}
