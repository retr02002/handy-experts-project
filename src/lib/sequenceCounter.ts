import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Client = PrismaClient | Prisma.TransactionClient;

/**
 * Atomically returns the next integer for a scope (e.g. "ORDER:ND",
 * "TECHNICIAN:MU", "VENDOR:PU"), creating the counter row on first use.
 * Compiles to a single native upsert-by-primary-key
 * (INSERT ... ON CONFLICT (id) DO UPDATE SET value = value + 1 RETURNING
 * value) — one round trip, safe under concurrent callers, no
 * read-then-write race. Pass a transaction client when the number must be
 * reserved atomically alongside the row that consumes it; a rolled-back
 * transaction simply burns that number (a gap), the same tolerance this
 * schema already accepts for LiveCall.ticketSeq gaps from failed orders.
 */
export async function nextSequence(scope: string, client: Client = prisma): Promise<number> {
  const row = await client.sequenceCounter.upsert({
    where: { id: scope },
    create: { id: scope, value: 1 },
    update: { value: { increment: 1 } },
    select: { value: true },
  });
  return row.value;
}
