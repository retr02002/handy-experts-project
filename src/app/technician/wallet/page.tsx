import React from "react";
import { getMyTechnicianWalletAction } from "@/actions/technicianWallet.actions";
import { TechnicianWalletClient } from "@/components/technician/TechnicianWalletClient";
import { redirect } from "next/navigation";

export default async function TechnicianWalletPage() {
  const res = await getMyTechnicianWalletAction();
  if (!res.success) {
    if (res.error === "Only freelance technicians have wallets") {
      redirect("/technician");
    }
  }

  const wallet = res.success && res.data ? res.data : { id: "", balance: 0, leadFeeType: "FIXED" as const, leadFeeAmount: 49, transactions: [] };

  return <TechnicianWalletClient initialWallet={wallet} />;
}
