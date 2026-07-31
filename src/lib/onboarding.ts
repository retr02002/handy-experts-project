import type { OnboardingStatus } from "@/actions/onboarding.actions";

/** Pure helper — kept out of the "use server" actions file since it isn't async. */
export function isOnboardingComplete(status: OnboardingStatus): boolean {
  if (status.role === "PENDING") return false;
  if (status.role === "SUPER_ADMIN") return true;
  if (!status.name || !status.phone) return false;
  if (status.role === "VENDOR") return status.hasVendorProfile;
  if (status.role === "TECHNICIAN") return status.hasTechnicianProfile;
  return true; // CUSTOMER with name + phone present
}

export function dashboardPathForRole(role: OnboardingStatus["role"]): string {
  switch (role) {
    case "VENDOR":
      return "/vendor";
    case "TECHNICIAN":
      return "/technician";
    case "SUPER_ADMIN":
      return "/admin";
    case "CUSTOMER":
      return "/customer";
    default:
      return "/onboarding";
  }
}
