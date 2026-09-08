import { redirect } from "next/navigation";
import { getProfileDetails } from "@/actions/profile.actions";
import { ProfileClient } from "./ProfileClient";

export default async function CustomerProfilePage() {
  const profile = await getProfileDetails();
  
  if (!profile) {
    redirect("/sign-in");
  }

  // Passing the serialized profile data to the client component
  return <ProfileClient profile={profile} />;
}
