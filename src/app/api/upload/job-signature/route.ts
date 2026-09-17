import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { putObject, deleteObject } from "@/lib/storage/objectStorage";
import { formatTicketNumber } from "@/lib/ticketNumber";

export const runtime = "nodejs";

const MAX_SIGNATURE_BYTES = 2 * 1024 * 1024;

/**
 * The customer's drawn signature, captured on the technician's phone at
 * completion. Upserted: re-signing (the first attempt smudged, the wrong
 * person signed) replaces the previous image rather than accumulating
 * several and leaving the document ambiguous about which one counts.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const serviceCallId = String(formData.get("serviceCallId") ?? "");
    const signerName = String(formData.get("signerName") ?? "").trim();

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 });
    }
    if (file.type !== "image/png") {
      return NextResponse.json({ error: "Signature must be a PNG" }, { status: 400 });
    }
    if (file.size > MAX_SIGNATURE_BYTES) {
      return NextResponse.json({ error: "Signature image is too large" }, { status: 400 });
    }
    if (signerName.length < 2) {
      return NextResponse.json({ error: "Who signed? Enter a name." }, { status: 400 });
    }

    const technician = await prisma.technicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!technician) return NextResponse.json({ error: "Technician profile not found" }, { status: 403 });

    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      select: {
        technicianId: true,
        status: true,
        liveCall: { select: { ticketSeq: true, orderCityCode: true, orderLocalityCode: true, orderSeq: true } },
      },
    });
    if (!call || call.technicianId !== technician.id) {
      return NextResponse.json({ error: "This job isn't assigned to you" }, { status: 403 });
    }
    if (call.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "A signature can only be taken while the job is in progress." }, { status: 409 });
    }

    const ticketNumber = call.liveCall ? formatTicketNumber(call.liveCall) : serviceCallId;

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putObject({
      folder: "job",
      prefix: `${ticketNumber}/signature`,
      extension: "png",
      body: buffer,
      contentType: "image/png",
    });

    const previous = await prisma.jobSignature.findUnique({
      where: { serviceCallId },
      select: { storageKey: true },
    });

    await prisma.jobSignature.upsert({
      where: { serviceCallId },
      create: { serviceCallId, url: stored.url, storageKey: stored.key, signerName },
      update: { url: stored.url, storageKey: stored.key, signerName, signedAt: new Date() },
    });

    if (previous && previous.storageKey !== stored.key) {
      await deleteObject(previous.storageKey).catch(() => {});
    }

    return NextResponse.json({ url: stored.url, signerName });
  } catch (error) {
    console.error("Job signature upload error:", error);
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 });
  }
}
