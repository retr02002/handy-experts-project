import React from "react";
import { getMyWalletAction } from "@/actions/wallet.actions";
import { VendorWalletClient } from "@/components/vendor/VendorWalletClient";

export default async function VendorWalletPage() {
  const res = await getMyWalletAction();
  const wallet = res.success && res.data ? res.data : { balance: 0, leadPricingType: "FLAT", leadPricingValue: 49, transactions: [] };

  return <VendorWalletClient initialWallet={wallet} />;
}
