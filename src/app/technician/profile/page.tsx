import { redirect } from "next/navigation";
import { getProfileDetails } from "@/actions/profile.actions";
import { TechnicianProfileClient } from "./TechnicianProfileClient";

export default async function TechnicianProfilePage() {
  const profile = await getProfileDetails();
  if (!profile) redirect("/sign-in");

  return <TechnicianProfileClient profile={profile} />;
}
