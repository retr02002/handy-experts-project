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

/**
 * Where logging out should land each role. Vendor/technician land back on
 * their own role's sign-up/sign-in step (already logged-out-safe —
 * OnboardingFlow branches on an unauthenticated session for these roles)
 * rather than the generic customer sign-in page. Admin lands on /admin,
 * which already renders its own dedicated login form (AdminLoginGate) for
 * any non-SUPER_ADMIN session, including none at all.
 */
export function logoutPathForRole(role: string | null | undefined): string {
  switch (role) {
    case "VENDOR":
      return "/onboarding?role=VENDOR";
    case "TECHNICIAN":
      return "/onboarding?role=TECHNICIAN";
    case "SUPER_ADMIN":
      return "/admin";
    default:
      return "/sign-in";
  }
}
