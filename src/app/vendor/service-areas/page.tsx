import React from "react";
import { redirect } from "next/navigation";
import { getProfileDetails } from "@/actions/profile.actions";
import { getMyServiceAreasAction } from "@/actions/vendorservicearea.actions";
import { ServiceAreasManager } from "@/components/vendor/ServiceAreasManager";

export default async function VendorServiceAreasPage() {
  const profile = await getProfileDetails();
  if (!profile) redirect("/sign-in");
  if (!profile.vendorProfile) redirect("/vendor");

  const res = await getMyServiceAreasAction();
  const areas = res.success ? (res.data ?? []) : [];

  return <ServiceAreasManager areas={areas} />;
}
