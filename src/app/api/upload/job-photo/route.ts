import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { putObject } from "@/lib/storage/objectStorage";
import { JOB_PHOTO_MAX_PER_PHASE, JOB_PHOTO_MAX_BYTES } from "@/lib/constants";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * One photo per request, deliberately. Multi-file uploads in a single
 * request give no per-file progress and fail as a unit — on a patchy
 * mobile connection that means losing four good photos because the fifth
 * timed out. One request each lets the client show a progress ring per
 * tile and retry only what failed.
 *
 * The row is written here, not deferred to the start/complete action, so
 * photos already uploaded survive whatever happens next.
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
    const phase = String(formData.get("phase") ?? "");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (phase !== "BEFORE" && phase !== "AFTER") {
      return NextResponse.json({ error: "Invalid phase" }, { status: 400 });
    }
    const extension = ALLOWED_IMAGE_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG or WEBP." }, { status: 400 });
    }
    if (file.size > JOB_PHOTO_MAX_BYTES) {
      return NextResponse.json(
        { error: `That photo is too large. Max ${JOB_PHOTO_MAX_BYTES / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const technician = await prisma.technicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!technician) return NextResponse.json({ error: "Technician profile not found" }, { status: 403 });

    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      select: { technicianId: true, status: true },
    });
    if (!call || call.technicianId !== technician.id) {
      return NextResponse.json({ error: "This job isn't assigned to you" }, { status: 403 });
    }

    // Before-photos belong to the moment of arrival, after-photos to the
    // moment of completion — accepting either at any time would let a
    // technician backfill a job days later.
    const expectedStatus = phase === "BEFORE" ? "EN_ROUTE" : "IN_PROGRESS";
    if (call.status !== expectedStatus) {
      return NextResponse.json(
        {
          error:
            phase === "BEFORE"
              ? "Before-photos can only be added while you're on the way."
              : "After-photos can only be added while the job is in progress.",
        },
        { status: 409 }
      );
    }

    const existing = await prisma.jobPhoto.count({ where: { serviceCallId, phase } });
    if (existing >= JOB_PHOTO_MAX_PER_PHASE) {
      return NextResponse.json(
        { error: `Up to ${JOB_PHOTO_MAX_PER_PHASE} photos for this stage.` },
        { status: 409 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putObject({
      folder: "job",
      prefix: `${serviceCallId}/${phase.toLowerCase()}`,
      extension,
      body: buffer,
      contentType: file.type,
    });

    const photo = await prisma.jobPhoto.create({
      data: {
        serviceCallId,
        phase,
        url: stored.url,
        storageKey: stored.key,
        contentType: file.type,
        sizeBytes: buffer.byteLength,
        uploadedById: technician.id,
      },
      select: { id: true, url: true, phase: true },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Job photo upload error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
