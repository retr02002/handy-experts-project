import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { hasTechnicianPhotoAction } from "@/actions/kyc.actions";
import { dashboardPathForRole } from "@/lib/onboarding";
import { CameraCaptureFlow } from "./CameraCaptureFlow";

export const metadata: Metadata = {
  title: "Add Your Photo | Handyzo",
  description: "Take a quick photo for your Handyzo technician profile and ID card.",
};

/**
 * Top-level, not nested under /technician — mirrors /onboarding's own
 * placement for the same reason: a redirect target living under the layout
 * that redirects to it would immediately re-trigger itself.
 */
export default async function CapturePhotoPage() {
  const status = await getOnboardingStatus();
  if (!status) redirect("/sign-in");
  if (status.role !== "TECHNICIAN") redirect(dashboardPathForRole(status.role));

  const photo = await hasTechnicianPhotoAction();
  if (photo.success && photo.data?.hasPhoto) redirect("/technician");

  return <CameraCaptureFlow />;
}
