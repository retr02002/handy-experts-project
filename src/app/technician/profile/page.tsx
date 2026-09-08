import { redirect } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import Image from "next/image";
import { getProfileDetails } from "@/actions/profile.actions";
import { AccountSettingsCard } from "@/components/shared/AccountSettingsCard";
import { TechnicianPhoneCard } from "@/components/technician/TechnicianPhoneCard";
import { LogoutMenuItem } from "@/components/shared/LogoutMenuItem";

function DetailCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <ClientIcon icon={icon} className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

export default async function TechnicianProfilePage() {
  const profile = await getProfileDetails();
  if (!profile) redirect("/sign-in");

  const userName = profile.name || "Technician";
  const technician = profile.technicianProfile;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your professional details and account settings.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="absolute -bottom-14 left-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white dark:bg-[#0F172A] p-1.5 shadow-lg">
                <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                  {profile.image ? (
                    <Image src={profile.image} alt={userName} fill className="object-cover" />
                  ) : (
                    <ClientIcon icon="ph:user" className="w-11 h-11 text-slate-400" />
                  )}
                </div>
              </div>
              {technician?.type === "FREELANCE" && (
                <div
                  className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0F172A]"
                  title="Freelance Technician"
                ></div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 pb-8 px-8 flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{userName}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
          {technician?.type === "VENDOR_MANAGED" && (
            <span className="mt-2 w-fit px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
              Managed by a vendor
            </span>
          )}
        </div>
      </div>

      {technician && (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <ClientIcon icon="ph:briefcase-fill" className="text-amber-500 w-5 h-5" />
            Professional Details
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Verified details from your registration. Contact support to update these.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailCard icon="ph:wrench" label="Primary Skill" value={technician.skillCategory} />
            <DetailCard icon="ph:clock-counter-clockwise" label="Experience" value={`${technician.experienceYears} years`} />
            <DetailCard icon="ph:map-pin" label="Service Area" value={technician.servicePincode} />
            <DetailCard
              icon="ph:identification-card"
              label="Employment Type"
              value={technician.type === "FREELANCE" ? "Freelance" : "Vendor Managed"}
            />
          </div>
        </div>
      )}

      <TechnicianPhoneCard initialPhone={profile.phone} />

      <AccountSettingsCard
        name={userName}
        email={profile.email || ""}
        hasPassword={profile.hasPassword}
        accentClass="text-amber-500"
      />

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <LogoutMenuItem />
      </div>
    </div>
  );
}
