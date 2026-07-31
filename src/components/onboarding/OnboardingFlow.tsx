"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { OnboardingShell } from "./OnboardingShell";
import { RoleSelectStep, type OnboardingRole } from "./RoleSelectStep";
import { CustomerDetailsStep } from "./CustomerDetailsStep";
import { VendorDetailsStep } from "./VendorDetailsStep";
import { TechnicianDetailsStep } from "./TechnicianDetailsStep";
import { dashboardPathForRole } from "@/lib/onboarding";
import type { OnboardingStatus } from "@/actions/onboarding.actions";

type Step = "role" | OnboardingRole;

function initialStepFor(status: OnboardingStatus): Step {
  if (status.role === "CUSTOMER" || status.role === "VENDOR" || status.role === "TECHNICIAN") {
    return status.role;
  }
  return "role";
}

export function OnboardingFlow({ status }: { status: OnboardingStatus }) {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState<Step>(initialStepFor(status));
  const [cameFromRoleSelect, setCameFromRoleSelect] = useState(false);

  const handleRoleSelect = (role: OnboardingRole) => {
    setCameFromRoleSelect(true);
    setStep(role);
  };

  const handleSuccess = async (role: OnboardingRole) => {
    // Refresh the JWT so the proxy sees the new role immediately, instead of
    // bouncing the user back here on their very next navigation.
    await update();
    toast.success("You're all set!");
    router.push(dashboardPathForRole(role));
  };

  const isWide = step === "VENDOR" || step === "TECHNICIAN";
  const backHandler = cameFromRoleSelect ? () => setStep("role") : undefined;

  return (
    <OnboardingShell wide={isWide}>
      {step === "role" && <RoleSelectStep onSelect={handleRoleSelect} />}
      {step === "CUSTOMER" && (
        <CustomerDetailsStep
          initialName={status.name ?? ""}
          onBack={backHandler}
          onSuccess={() => handleSuccess("CUSTOMER")}
        />
      )}
      {step === "VENDOR" && (
        <VendorDetailsStep
          initialName={status.name ?? ""}
          onBack={backHandler}
          onSuccess={() => handleSuccess("VENDOR")}
        />
      )}
      {step === "TECHNICIAN" && (
        <TechnicianDetailsStep
          initialName={status.name ?? ""}
          onBack={backHandler}
          onSuccess={() => handleSuccess("TECHNICIAN")}
        />
      )}
    </OnboardingShell>
  );
}
