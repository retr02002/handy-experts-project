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
  //
  // The three checks below are independent of each other (each derives its
  // own technicianId from the session), so they're fetched together —
  // this layout runs on every single technician page navigation, and
  // running them one at a time was 3 sequential session+DB round trips
  // where one concurrent batch does the same work. The redirect PRIORITY
  // (city before photo) is still applied afterwards, against the already-
  // resolved results, so behavior is unchanged.
  let technicianType = "VENDOR_MANAGED";
  if (status?.role === "TECHNICIAN") {
    const { getMyTechnicianTypeAction } = await import("@/actions/technician.actions");
    const [cityStatus, photo, typeRes] = await Promise.all([
      hasTechnicianCityAction(),
      hasTechnicianPhotoAction(),
      getMyTechnicianTypeAction(),
    ]);

    if (cityStatus.success && !cityStatus.data?.hasCity) {
      redirect("/select-city");
    }
    if (photo.success && !photo.data?.hasPhoto) {
      redirect("/capture-photo");
    }
    if (typeRes.success) {
      technicianType = typeRes.data?.type ?? "VENDOR_MANAGED";
    }
  }

  return <TechnicianLayoutWrapper technicianType={technicianType}>{children}</TechnicianLayoutWrapper>;
}
