import React from "react";
import { redirect } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import Image from "next/image";
import { getProfileDetails } from "@/actions/profile.actions";
import { AccountSettingsCard } from "@/components/shared/AccountSettingsCard";
import { LogoutMenuItem } from "@/components/shared/LogoutMenuItem";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white text-right">{value}</span>
    </div>
  );
}

export default async function VendorProfilePage() {
  const profile = await getProfileDetails();
  if (!profile) redirect("/sign-in");

  const userName = profile.name || "Vendor";
  const avatarInitial = userName.charAt(0).toUpperCase() || "V";
  const vendor = profile.vendorProfile;

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your registered company information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-500/5"></div>

            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 rounded-full bg-white dark:bg-[#0B1120] p-1.5 shadow-md border border-slate-100 dark:border-slate-800 relative z-10">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden relative">
                  {profile.image ? (
                    <Image src={profile.image} alt={userName} fill className="object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white relative z-10">
              {vendor?.companyName || userName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 relative z-10">{userName} &middot; Contact Person</p>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-6 relative z-10"></div>

            <div className="w-full space-y-1 relative z-10 text-left">
              {vendor ? (
                <>
                  <DetailRow label="Company Type" value={vendor.companyType} />
                  <DetailRow label="GST Number" value={vendor.gstNumber} />
                  <DetailRow label="PAN Number" value={vendor.panNumber} />
                  <DetailRow
                    label="Incorporated"
                    value={new Date(vendor.incorporationDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                </>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">No company details on file yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <LogoutMenuItem />
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-8 space-y-8">
          {vendor && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <ClientIcon icon="ph:buildings-fill" className="text-blue-500 w-5 h-5" />
                Company Details
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Registered business details are locked after verification. Contact support to update these.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <DetailRow label="Company Name" value={vendor.companyName} />
                <DetailRow label="Company Type" value={vendor.companyType} />
                <DetailRow label="GST Number" value={vendor.gstNumber} />
                <DetailRow label="PAN Number" value={vendor.panNumber} />
                <DetailRow label="Aadhaar Number" value={vendor.aadhaarNumber} />
                <DetailRow label="Pincode" value={vendor.pincode} />
              </div>
              <div className="mt-1">
                <DetailRow label="Address" value={vendor.address} />
                <DetailRow label="City / State" value={`${vendor.city}, ${vendor.state}`} />
              </div>
            </div>
          )}

          <AccountSettingsCard name={userName} email={profile.email || ""} hasPassword={profile.hasPassword} />
        </div>
      </div>
    </div>
  );
}
