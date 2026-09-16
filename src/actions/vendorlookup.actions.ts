"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/actions/auth.actions";
import { formatTicketNumber, parseTicketNumber } from "@/lib/ticketNumber";

async function requireVendorId(): Promise<{ vendorId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { vendorId: null, error: "Not signed in as a vendor" };
  }
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { vendorId: null, error: "Vendor profile not found" };
  return { vendorId: profile.id, error: null };
}

export interface TicketLookupHistoryEntry {
  ticketNumber: string;
  status: string;
  total: number;
  completedAt: string | null;
  createdAt: string;
}

export interface TicketLookupResult {
  ticketNumber: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  itemSummary: string;
  total: number;
  technicianName: string | null;
  /** Area-level context only, no street address — this view is deliberately minimal. */
  city: string;
  /** Every past visit from this same customer, oldest first, for repeat-order context. Excludes the matched ticket itself. */
  history: TicketLookupHistoryEntry[];
}

/**
 * A deliberately minimal, ticket-scoped lookup — never customerName/phone/
 * email/address/pincode/coordinates, by design (requirement: work + amount
 * history only, not customer identity). Writes its own mapper rather than
 * reusing servicecall.actions.ts's mapServiceCallRow, so this endpoint can
 * never silently widen if that shared mapper changes later. Scoped strictly
 * to the calling vendor's own jobs — a correct ticket number belonging to a
 * different vendor returns nothing, never a cross-vendor peek.
 */
export async function lookupTicketForVendorAction(query: string): Promise<ActionResponse<TicketLookupResult | null>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  const trimmed = query.trim();
  if (!trimmed) return { success: true, data: null };

  try {
    const parsed = parseTicketNumber(trimmed);
    const ticketWhere =
      parsed?.kind === "legacy"
        ? { liveCall: { ticketSeq: parsed.ticketSeq } }
        : parsed?.kind === "structured"
          ? { liveCall: { orderCityCode: parsed.cityCode, orderSeq: parsed.orderSeq } }
          : { OR: [{ id: trimmed }, { liveCallId: trimmed }] };

    const call = await prisma.serviceCall.findFirst({
      where: { vendorId, ...ticketWhere },
      select: {
        status: true,
        createdAt: true,
        completedAt: true,
        customerId: true,
        technician: { select: { user: { select: { name: true } } } },
        liveCall: {
          select: {
            ticketSeq: true,
            orderCityCode: true,
            orderLocalityCode: true,
            orderSeq: true,
            city: true,
            total: true,
            items: { select: { packageName: true, quantity: true } },
          },
        },
      },
    });
    if (!call) return { success: true, data: null };

    // Every other completed job this same customer has had with this
    // vendor — the "previous work history and amount history" the
    // requirement asks for, keyed off the customer without ever exposing
    // who that customer is.
    const priorCalls = await prisma.serviceCall.findMany({
      where: { vendorId, customerId: call.customerId, liveCall: { ticketSeq: { not: call.liveCall.ticketSeq } } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        status: true,
        createdAt: true,
        completedAt: true,
        liveCall: { select: { ticketSeq: true, orderCityCode: true, orderLocalityCode: true, orderSeq: true, total: true } },
      },
    });

    return {
      success: true,
      data: {
        ticketNumber: formatTicketNumber(call.liveCall),
        status: call.status,
        createdAt: call.createdAt.toISOString(),
        completedAt: call.completedAt?.toISOString() ?? null,
        itemSummary: call.liveCall.items.map((i) => `${i.packageName}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", "),
        total: call.liveCall.total,
        technicianName: call.technician?.user.name ?? null,
        city: call.liveCall.city,
        history: priorCalls.map((p) => ({
          ticketNumber: formatTicketNumber(p.liveCall),
          status: p.status,
          total: p.liveCall.total,
          completedAt: p.completedAt?.toISOString() ?? null,
          createdAt: p.createdAt.toISOString(),
        })),
      },
    };
  } catch (err) {
    console.error("Lookup ticket for vendor error:", err);
    return { success: false, error: "Failed to look up this ticket" };
  }
}
