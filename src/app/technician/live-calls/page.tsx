import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FreelanceLiveCallsPanel } from "@/components/technician/live-calls/FreelanceLiveCallsPanel";

export default async function FreelanceLiveCallsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/sign-in");

  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      location: true,
      serviceAreas: true,
    }
  });

  if (!technician || technician.type !== "FREELANCE") {
    redirect("/technician");
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Calls</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Nearby customer orders matching your skills, broadcast in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Tracking Active
        </div>
      </div>

      {technician?.location?.latitude != null && technician?.location?.longitude != null ? (
        <FreelanceLiveCallsPanel 
          technicianLatitude={technician.location.latitude} 
          technicianLongitude={technician.location.longitude} 
          serviceAreas={technician.serviceAreas}
        />
      ) : (
        <div className="p-8 text-center bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">Location not set</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
            Please make sure your location is set so we can send you nearby live calls.
          </p>
        </div>
      )}
    </div>
  );
}
