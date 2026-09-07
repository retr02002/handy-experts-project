import React from "react";
import { redirect } from "next/navigation";
import { getProfileDetails } from "@/actions/profile.actions";
import { getMyServiceAreasAction } from "@/actions/technicianservicearea.actions";
import { ServiceAreasManager } from "@/components/technician/ServiceAreasManager";

export default async function TechnicianServiceAreasPage() {
  const profile = await getProfileDetails();
  if (!profile) redirect("/sign-in");
  if (!profile.technicianProfile) redirect("/technician");

  const res = await getMyServiceAreasAction();
  const areas = res.success ? (res.data ?? []) : [];

  return <ServiceAreasManager areas={areas} />;
}
