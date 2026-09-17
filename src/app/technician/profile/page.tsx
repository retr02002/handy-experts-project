import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProfileDetails } from "@/actions/profile.actions";
import { getMyTechnicianDocumentsAction } from "@/actions/kyc.actions";
import { buildTechnicianIdCardData } from "@/lib/pdf/idCardData";
import { TechnicianProfileClient } from "./TechnicianProfileClient";
import type { IdCardPreviewData } from "@/components/technician/IdCardPreview";

export default async function TechnicianProfilePage() {
  const session = await getServerSession(authOptions);
  const profile = await getProfileDetails();
  if (!profile || !session?.user?.id) redirect("/sign-in");

  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const [docsResult, idCardData] = await Promise.all([
    getMyTechnicianDocumentsAction(),
    technician ? buildTechnicianIdCardData(technician.id) : Promise.resolve(null),
  ]);

  const documents = docsResult.success ? (docsResult.data ?? []) : [];

  const idCardPreviewData: IdCardPreviewData | null = idCardData
    ? {
        platformName: idCardData.platformName,
        platformTagline: idCardData.platformTagline,
        name: idCardData.name,
        role: idCardData.role,
        idNumber: idCardData.idNumber,
        photoDataUri: idCardData.photo?.dataUri ?? null,
        signatureDataUri: idCardData.signature?.dataUri ?? null,
        experienceLabel: `${idCardData.experienceYears} yr${idCardData.experienceYears === 1 ? "" : "s"}`,
        ratingLabel: idCardData.rating ? `${idCardData.rating.avg.toFixed(1)} ★ (${idCardData.rating.count})` : "New",
        vendor: idCardData.vendor
          ? { name: idCardData.vendor.name, logoDataUri: idCardData.vendor.logo?.dataUri ?? null }
          : null,
      }
    : null;

  return <TechnicianProfileClient profile={profile} documents={documents} idCardData={idCardPreviewData} />;
}
