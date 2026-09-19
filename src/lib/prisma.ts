import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

// Explicit bounds instead of pg's untuned defaults.
//
// max is higher than pg's default (10) on purpose: DATABASE_URL points at
// pooled.db.prisma.io, itself a pooler in front of the real Postgres, built
// to handle many client connections cheaply — capping this process's own
// pool too low just creates artificial queueing here for no protection
// benefit. This was previously found to be a real bottleneck: with several
// vendor dashboards each running ~4 usePolling loops every few seconds, the
// old max:10 pool queued technician job actions (start/accept/complete)
// behind that polling traffic, waiting up to connectionTimeoutMillis before
// a connection freed up.
//
// connectionTimeoutMillis is short on purpose too — under real contention
// this should fail fast with a clear, retryable error instead of a long
// silent wait that reads as "stuck".
const pool = new Pool({
  connectionString,
  max: 25,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 4_000,
});
const adapter = new PrismaPg(pool);
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
