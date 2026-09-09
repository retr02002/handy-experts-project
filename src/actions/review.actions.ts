"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import type { Prisma } from "@prisma/client";

export interface ReviewInput {
  technicianRating: number;
  technicianComment?: string;
  serviceRating: number;
  serviceComment?: string;
}

export interface ReviewItem {
  id: string;
  serviceCallId: string;
  customerName: string;
  technicianName: string | null;
  itemSummary: string;
  technicianRating: number;
  technicianComment: string | null;
  serviceRating: number;
  serviceComment: string | null;
  createdAt: string;
}

const reviewWithContext = {
  customer: { select: { name: true } },
  technician: { select: { user: { select: { name: true } } } },
  serviceCall: { select: { liveCall: { select: { items: { select: { packageName: true } } } } } },
} satisfies Prisma.ReviewInclude;

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewWithContext }>;

function mapReview(r: ReviewRow): ReviewItem {
  return {
    id: r.id,
    serviceCallId: r.serviceCallId,
    customerName: r.customer.name ?? "Customer",
    technicianName: r.technician?.user.name ?? null,
    itemSummary: r.serviceCall.liveCall.items.map((i) => i.packageName).join(", "),
    technicianRating: r.technicianRating,
    technicianComment: r.technicianComment,
    serviceRating: r.serviceRating,
    serviceComment: r.serviceComment,
    createdAt: r.createdAt.toISOString(),
  };
}

function isValidScore(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/**
 * The customer's verdict on a finished job. One per job, customer-only, and
 * only once the work is actually COMPLETED — a rating before that would be
 * rating something that hasn't happened.
 *
 * Both aggregates are recomputed inside the same transaction as the insert,
 * so a review is never visible without the numbers it should have moved.
 */
export async function submitReviewAction(serviceCallId: string, input: ReviewInput): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const userId = session.user.id;

  if (!isValidScore(input.technicianRating) || !isValidScore(input.serviceRating)) {
    return { success: false, error: "Ratings must be between 1 and 5 stars" };
  }
  const technicianComment = input.technicianComment?.trim().slice(0, 1000) || null;
  const serviceComment = input.serviceComment?.trim().slice(0, 1000) || null;

  try {
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      select: {
        customerId: true,
        vendorId: true,
        technicianId: true,
        status: true,
        review: { select: { id: true } },
        liveCall: { select: { items: { select: { package: { select: { serviceId: true } } } } } },
      },
    });
    if (!call) return { success: false, error: "Job not found" };
    if (call.customerId !== userId) return { success: false, error: "You can only review your own orders" };
    if (call.status !== "COMPLETED") return { success: false, error: "You can review a job once it's completed" };
    if (call.review) return { success: false, error: "You've already reviewed this job" };

    const serviceIds = [
      ...new Set(call.liveCall.items.map((i) => i.package?.serviceId).filter((id): id is string => !!id)),
    ];

    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          serviceCallId,
          customerId: userId,
          technicianId: call.technicianId,
          vendorId: call.vendorId,
          technicianRating: input.technicianRating,
          technicianComment,
          serviceRating: input.serviceRating,
          serviceComment,
          serviceIds,
        },
      });

      if (call.technicianId) {
        const agg = await tx.review.aggregate({
          where: { technicianId: call.technicianId },
          _avg: { technicianRating: true },
          _count: true,
        });
        await tx.technicianProfile.update({
          where: { id: call.technicianId },
          data: { ratingAvg: agg._avg.technicianRating, ratingCount: agg._count },
        });
      }

      for (const serviceId of serviceIds) {
        const agg = await tx.review.aggregate({
          where: { serviceIds: { has: serviceId } },
          _avg: { serviceRating: true },
          _count: true,
        });
        await tx.service.update({
          where: { id: serviceId },
          data: { ratingAvg: agg._avg.serviceRating, ratingCount: agg._count },
        });
      }
    });

    revalidatePath("/customer/reviews");
    revalidatePath("/vendor/reviews");
    revalidatePath("/technician/feedback");
    revalidatePath("/services");
    return { success: true };
  } catch (err) {
    console.error("Submit review error:", err);
    return { success: false, error: "Failed to submit your review" };
  }
}

/** The signed-in customer's own reviews. */
export async function getMyReviewsAction(): Promise<ActionResponse<ReviewItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    const rows = await prisma.review.findMany({
      where: { customerId: session.user.id },
      include: reviewWithContext,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { success: true, data: rows.map(mapReview) };
  } catch (err) {
    console.error("Get my reviews error:", err);
    return { success: false, error: "Failed to load your reviews" };
  }
}

/** Everything customers said about this vendor's jobs. */
export async function getReviewsForVendorAction(): Promise<ActionResponse<ReviewItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { success: false, error: "Not signed in as a vendor" };
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!vendor) return { success: false, error: "Vendor profile not found" };

    const rows = await prisma.review.findMany({
      where: { vendorId: vendor.id },
      include: reviewWithContext,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { success: true, data: rows.map(mapReview) };
  } catch (err) {
    console.error("Get vendor reviews error:", err);
    return { success: false, error: "Failed to load reviews" };
  }
}

/** The signed-in technician's own reviews. */
export async function getMyTechnicianReviewsAction(): Promise<ActionResponse<ReviewItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Not signed in as a technician" };
  }

  try {
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) return { success: false, error: "Technician profile not found" };

    const rows = await prisma.review.findMany({
      where: { technicianId: profile.id },
      include: reviewWithContext,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { success: true, data: rows.map(mapReview) };
  } catch (err) {
    console.error("Get technician reviews error:", err);
    return { success: false, error: "Failed to load reviews" };
  }
}

/** Every review on the platform, for the admin console. */
export async function getAllReviewsAction(): Promise<ActionResponse<ReviewItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const rows = await prisma.review.findMany({
      include: reviewWithContext,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return { success: true, data: rows.map(mapReview) };
  } catch (err) {
    console.error("Get all reviews error:", err);
    return { success: false, error: "Failed to load reviews" };
  }
}

export interface TechnicianPublicProfile {
  technicianId: string;
  name: string;
  image: string | null;
  skillCategory: string;
  experienceYears: number;
  ratingAvg: number | null;
  ratingCount: number;
  jobsCompleted: number;
  recentReviews: ReviewItem[];
}

/**
 * The Rapido-style card a customer sees for whoever is coming: who they are,
 * how experienced, what other customers scored them. Readable by anyone
 * signed in — it's the same information you'd show before booking.
 */
export async function getTechnicianPublicProfileAction(
  technicianId: string
): Promise<ActionResponse<TechnicianPublicProfile>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    const [profile, jobsCompleted, recent] = await Promise.all([
      prisma.technicianProfile.findUnique({
        where: { id: technicianId },
        select: {
          id: true,
          skillCategory: true,
          experienceYears: true,
          ratingAvg: true,
          ratingCount: true,
          user: { select: { name: true, image: true } },
        },
      }),
      prisma.serviceCall.count({ where: { technicianId, status: "COMPLETED" } }),
      prisma.review.findMany({
        where: { technicianId },
        include: reviewWithContext,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    if (!profile) return { success: false, error: "Technician not found" };

    return {
      success: true,
      data: {
        technicianId: profile.id,
        name: profile.user.name ?? "Technician",
        image: profile.user.image,
        skillCategory: profile.skillCategory,
        experienceYears: profile.experienceYears,
        ratingAvg: profile.ratingAvg,
        ratingCount: profile.ratingCount,
        jobsCompleted,
        recentReviews: recent.map(mapReview),
      },
    };
  } catch (err) {
    console.error("Get technician public profile error:", err);
    return { success: false, error: "Failed to load technician details" };
  }
}
