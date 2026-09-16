import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildTechnicianIdCardData, type TechnicianIdCardData } from "@/lib/pdf/idCardData";
import { IdCardDocument } from "@/lib/pdf/IdCardDocument";

export const runtime = "nodejs";

// Kept out of the try/catch below as its own function — renderToBuffer does
// real async rendering work that can genuinely throw (a malformed embedded
// image, for instance), not a React error-boundary scenario, but isolating
// the JSX construction site here keeps it unambiguous either way.
function renderIdCardPdf(data: TechnicianIdCardData) {
  return renderToBuffer(<IdCardDocument data={data} />);
}
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Streams a technician's ID card as a PDF. No `technicianId` query param is
 * the self-service path used by the technician's own profile page's plain
 * <a href download> link; a `technicianId` param is the admin/vendor path
 * used from the read-only Documents tabs on a technician's detail page.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const requestedId = new URL(req.url).searchParams.get("technicianId");
  const role = session.user.role;

  let technicianId: string;

  if (!requestedId) {
    if (role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const self = await prisma.technicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!self) return NextResponse.json({ error: "Technician profile not found" }, { status: 404 });
    technicianId = self.id;
  } else if (role === "SUPER_ADMIN") {
    technicianId = requestedId;
  } else if (role === "VENDOR") {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    const owns =
      vendor &&
      (await prisma.technicianProfile.findFirst({ where: { id: requestedId, vendorId: vendor.id }, select: { id: true } }));
    if (!owns) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    technicianId = requestedId;
  } else {
    // A TECHNICIAN session requesting someone else's card (or any other
    // combination) is denied outright — no cross-technician self-service.
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const data = await buildTechnicianIdCardData(technicianId);
    if (!data) return NextResponse.json({ error: "Technician not found" }, { status: 404 });

    const buffer = await renderIdCardPdf(data);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${data.idNumber}-id-card.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("ID card generation error:", error);
    return NextResponse.json({ error: "Failed to generate the ID card" }, { status: 500 });
  }
}
