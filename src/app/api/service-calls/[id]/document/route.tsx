import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildJobDocumentData, type DocumentAudience } from "@/lib/pdf/documentData";
import { JobDocument } from "@/lib/pdf/JobDocument";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Streams the combined job report + invoice as a PDF.
 *
 * A route handler rather than a server action because only a route can set
 * Content-Disposition — which means a plain <a href download> works, with
 * no client JS and no base64 round trip through the RSC payload.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audienceParam = new URL(req.url).searchParams.get("audience");
  const audience: DocumentAudience = audienceParam === "vendor" ? "vendor" : "customer";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Technicians never get either copy. They're shown the final amount
  // in-app and nothing more — the whole point of the post-completion
  // masking is undone if they can pull the customer's full invoice.
  if (session.user.role === "TECHNICIAN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const call = await prisma.serviceCall.findUnique({
    where: { id },
    select: {
      status: true,
      customerId: true,
      vendor: { select: { userId: true } },
    },
  });
  if (!call) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const isAdmin = session.user.role === "SUPER_ADMIN";
  const allowed = isAdmin
    ? true
    : audience === "customer"
      ? call.customerId === session.user.id
      : call.vendor.userId === session.user.id;
  if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  // Documents describe finished work — issuing an invoice for a job still
  // in progress would put a number in a customer's hands that can still change.
  if (call.status !== "COMPLETED") {
    return NextResponse.json({ error: "This job isn't completed yet." }, { status: 409 });
  }

  try {
    const data = await buildJobDocumentData(id, audience);
    if (!data) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const buffer = await renderToBuffer(<JobDocument data={data} />);
    const filename = `${data.ticketNumber}-${audience === "customer" ? "invoice" : "job-report"}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Job document generation error:", error);
    return NextResponse.json({ error: "Failed to generate the document" }, { status: 500 });
  }
}
