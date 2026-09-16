import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PLATFORM_IDENTITY } from "@/lib/companyIdentity";

export const metadata: Metadata = {
  title: "Verify Technician | Handyzo",
  robots: { index: false, follow: false },
};

/**
 * Reached by scanning the "Scan to Verify" QR on a technician's ID card —
 * public, no session, no chrome (same top-level-outside-any-layout
 * placement reasoning as /capture-photo and /select-city). Shows only what
 * the card itself already displays: name, category, vendor. Explicitly
 * excludes phone, address, Aadhaar/PAN and the signature image — this page
 * exists to confirm identity to a stranger scanning a badge, not to hand
 * out anything sensitive.
 */
export default async function VerifyTechnicianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    select: {
      skillCategory: true,
      user: { select: { name: true } },
      vendor: { select: { companyName: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-10 gap-6">
      <Image src="/logo-org.svg" alt={PLATFORM_IDENTITY.name} width={140} height={48} className="h-10 w-auto object-contain" />

      {technician ? (
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-600">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
            </svg>
          </div>
          <p className="text-sm font-bold text-emerald-600">Verified Technician</p>
          <p className="text-xl font-bold text-slate-900">{technician.user.name ?? "Technician"}</p>
          <p className="text-sm text-slate-500">{technician.skillCategory}</p>
          <p className="text-xs text-slate-400 mt-2 pt-3 border-t border-slate-100 w-full">
            {technician.vendor ? `Works with ${technician.vendor.companyName}` : `Independent ${PLATFORM_IDENTITY.name} technician`}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <p className="text-sm font-bold text-rose-600">This ID could not be verified</p>
        </div>
      )}
    </div>
  );
}
