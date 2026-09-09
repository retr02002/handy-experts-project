"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { OnboardingShell } from "./OnboardingShell";
import { RoleSelectStep, type OnboardingRole } from "./RoleSelectStep";
import { CustomerDetailsStep } from "./CustomerDetailsStep";
import { VendorDetailsStep } from "./VendorDetailsStep";
import { TechnicianDetailsStep } from "./TechnicianDetailsStep";
import { RoleCredentialsStep } from "./RoleCredentialsStep";
import { TechnicianCredentialsStep } from "./TechnicianCredentialsStep";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { dashboardPathForRole, isOnboardingComplete } from "@/lib/onboarding";
import { getOnboardingStatus, type OnboardingStatus } from "@/actions/onboarding.actions";

type Step = "role" | OnboardingRole;

function initialStepFor(status: OnboardingStatus | null, roleParam: string | null): Step {
  if (status?.role === "CUSTOMER" || status?.role === "VENDOR" || status?.role === "TECHNICIAN") {
    return status.role;
  }
  if (roleParam === "VENDOR" || roleParam === "TECHNICIAN") {
    return roleParam;
  }
  return "role";
}

export function OnboardingFlow({ status }: { status: OnboardingStatus | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus, update } = useSession();
  const [step, setStep] = useState<Step>(() => initialStepFor(status, searchParams.get("role")));
  const [cameFromRoleSelect, setCameFromRoleSelect] = useState(false);
  // Swaps the whole step out for a spinner during the post-auth/post-signup
  // redirect gap — without this, whatever form was on screen when the user
  // submitted stays fully visible (just disabled) for the ~1-2s it takes to
  // refresh the session and decide where to send them.
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRoleSelect = (role: OnboardingRole) => {
    setCameFromRoleSelect(true);
    setStep(role);
    if (role === "VENDOR" || role === "TECHNICIAN") {
      router.replace(`/onboarding?role=${role}`, { scroll: false });
    }
  };

  const backToRoleSelect = () => {
    setStep("role");
    router.replace("/onboarding", { scroll: false });
  };
  const backHandler = cameFromRoleSelect ? backToRoleSelect : undefined;

  const handleSuccess = async (role: OnboardingRole) => {
    setIsRedirecting(true);
    // Refresh the JWT so the proxy sees the new role immediately, instead of
    // bouncing the user back here on their very next navigation.
    await update();
    toast.success("You're all set!");
    router.push(dashboardPathForRole(role));
  };

  // After the credentials step authenticates (sign up OR log in), check
  // whether this account already has a complete profile *for the role being
  // set up here* — an existing vendor/technician logging back in on the
  // matching tab should land straight on their dashboard instead of being
  // forced to re-fill the details form they already submitted once. A login
  // for a different role entirely still falls through to the mismatch
  // notice below, rather than silently whisking them off to an unrelated
  // dashboard.
  const handleRoleAuthenticated = async (targetRole: OnboardingRole) => {
    setIsRedirecting(true);
    // update() refreshes the client-side session/JWT; getOnboardingStatus()
    // does its own independent getServerSession + fresh DB read, so it
    // doesn't need update() to have finished first — running them together
    // cuts a full sequential round trip off this path.
    const [, fresh] = await Promise.all([update(), getOnboardingStatus()]);
    if (fresh && fresh.role === targetRole && isOnboardingComplete(fresh)) {
      // A hard navigation here (rather than router.push) avoids a race with
      // Next's client router cache: the target dashboard layout re-reads the
      // session server-side, and a soft push landed here before the just-
      // updated session cookie was guaranteed to be in effect for that read.
      window.location.assign(dashboardPathForRole(fresh.role));
      return;
    }
    // Otherwise fall through — the re-render below picks up the now-
    // authenticated session and shows the details step to finish up.
    setIsRedirecting(false);
  };

  const isWide = step === "VENDOR" || step === "TECHNICIAN";
  const liveRole = session?.user?.role;

  if (isRedirecting) {
    return (
      <OnboardingShell wide={isWide}>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
          <ClientIcon icon="svg-spinners:180-ring" className="w-8 h-8 text-[#00B4FF]" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Taking you to your dashboard...</p>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell wide={isWide}>
      {step === "role" && <RoleSelectStep onSelect={handleRoleSelect} />}

      {step === "CUSTOMER" && (
        <CustomerDetailsStep
          initialName={status?.name ?? ""}
          onBack={backHandler}
          onSuccess={() => handleSuccess("CUSTOMER")}
        />
      )}

      {(step === "VENDOR" || step === "TECHNICIAN") &&
        (sessionStatus === "loading" ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <ClientIcon icon="svg-spinners:180-ring" className="w-6 h-6 text-slate-400" />
          </div>
        ) : sessionStatus === "unauthenticated" ? (
          step === "VENDOR" ? (
            <RoleCredentialsStep role="VENDOR" onBack={backHandler} onAuthenticated={() => handleRoleAuthenticated(step)} />
          ) : (
            <TechnicianCredentialsStep onBack={backHandler} onAuthenticated={() => handleRoleAuthenticated(step)} />
          )
        ) : liveRole !== "PENDING" && liveRole !== step ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-5 sm:px-8 py-10">
            {backHandler && (
              <button
                type="button"
                onClick={backHandler}
                className="self-start flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 -mt-6 mb-2 cursor-pointer"
              >
                <ClientIcon icon="ph:arrow-left-bold" className="w-3.5 h-3.5" /> Back
              </button>
            )}
            <ClientIcon icon="ph:warning-circle-fill" className="w-10 h-10 text-amber-500" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              This account isn&apos;t registered as a {step === "VENDOR" ? "company/vendor" : "technician"}.
            </p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/onboarding" })}
              className="text-sm font-bold text-[#00B4FF] hover:underline cursor-pointer"
            >
              Log out and try another account
            </button>
          </div>
        ) : step === "VENDOR" ? (
          <VendorDetailsStep
            initialName={session?.user?.name ?? status?.name ?? ""}
            onBack={backHandler}
            onSuccess={() => handleSuccess("VENDOR")}
          />
        ) : (
          <TechnicianDetailsStep
            initialName={session?.user?.name ?? status?.name ?? ""}
            onBack={backHandler}
            onSuccess={() => handleSuccess("TECHNICIAN")}
          />
        ))}
    </OnboardingShell>
  );
}
