import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOnboardingStatus } from "@/actions/onboarding.actions";
import { hasTechnicianCityAction, getVendorCityForTechnicianAction } from "@/actions/kyc.actions";
import { dashboardPathForRole } from "@/lib/onboarding";
import { SelectCityFlow } from "./SelectCityFlow";

export const metadata: Metadata = {
  title: "Select Your City | Handyzo",
  description: "Tell us which city you work in to finish setting up your Handyzo technician ID.",
};

/**
 * Top-level, not nested under /technician — mirrors /capture-photo's own
 * placement for the same reason: a redirect target living under the layout
 * that redirects to it would immediately re-trigger itself.
 */
export default async function SelectCityPage() {
  const status = await getOnboardingStatus();
  if (!status) redirect("/sign-in");
  if (status.role !== "TECHNICIAN") redirect(dashboardPathForRole(status.role));

  const cityStatus = await hasTechnicianCityAction();
  if (cityStatus.success && cityStatus.data?.hasCity) redirect("/technician");

  const vendorCityResult = await getVendorCityForTechnicianAction();
  const vendorCity = vendorCityResult.success ? (vendorCityResult.data?.vendorCity ?? null) : null;

  return <SelectCityFlow defaultCity={vendorCity} />;
}
