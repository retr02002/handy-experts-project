import { redirect } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import Image from "next/image";
import { getProfileDetails } from "@/actions/profile.actions";
import { AccountSettingsCard } from "@/components/shared/AccountSettingsCard";
import { LogoutMenuItem } from "@/components/shared/LogoutMenuItem";

export default async function CustomerProfilePage() {
  const profile = await getProfileDetails();
  if (!profile) redirect("/sign-in");

  const userName = profile.name || "Customer";
  const avatarInitial = userName.charAt(0).toUpperCase() || "C";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#00B4FF] flex items-center justify-center text-white font-bold text-3xl ring-4 ring-blue-50 dark:ring-slate-700 overflow-hidden relative shrink-0">
            {profile.image ? (
              <Image src={profile.image} alt={userName} fill className="object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userName}</h2>
            <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
            {profile.phone && (
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center md:justify-start mt-1">
                <ClientIcon icon="ph:phone" className="w-3.5 h-3.5" /> {profile.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      <AccountSettingsCard name={userName} email={profile.email || ""} hasPassword={profile.hasPassword} />

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">More</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Addresses</span>
            <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Payment Methods</span>
            <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-400" />
          </button>
          <LogoutMenuItem />
        </div>
      </div>
    </div>
  );
}
