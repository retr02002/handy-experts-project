/**
 * One-off: wipes every order/call/review/history row for a clean end-to-end
 * test run — WITHOUT touching any account (customer, technician, vendor,
 * admin) or catalog data (Category, Service, ServicePackage, Coupon, KYC
 * docs, support tickets, platform documents).
 *
 * Run with: npx tsx prisma/wipe-order-history.ts
 *
 * prisma.liveCall.deleteMany({}) alone cascades through LiveCallItem,
 * ServiceCall, ServiceCallOffer, ServiceCallHandover, JobPhoto, JobSignature,
 * ServiceReport, Review, and ChatMessage — the whole job/call/review graph.
 * Everything else here is related but NOT FK-cascaded, so it's cleaned up
 * explicitly: job-related notifications (support-ticket notifications are
 * left alone), wallet transaction rows that reference a liveCallId (wallet
 * BALANCES are left untouched — only the history log rows for now-deleted
 * orders), the denormalized rating fields that go stale once Review rows are
 * gone, and the ORDER:* ticket sequence counters (so post-wipe test orders
 * get clean numbering again — technician/vendor id counters are untouched).
 *
 * Deliberately NOT touching: User, TechnicianProfile, VendorProfile,
 * KycDocument, SupportTicket/messages, VendorServiceArea, VendorCategory,
 * TechnicianCategory/TechnicianService, TechnicianLocationEvent (duty/GPS
 * log, not order history), Coupon, PlatformDocument, Category, Service,
 * ServicePackage, or any bucket file already uploaded (old job photos/
 * signatures become orphaned but harmless — new orders get fresh
 * ticket-number-based folders with no collision).
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JOB_NOTIFICATION_TYPES = [
  "NEW_LIVE_CALL",
  "CALL_ACCEPTED",
  "CALL_ASSIGNED",
  "CALL_STATUS_UPDATE",
  "JOB_OFFER",
  "JOB_UNASSIGNED",
  "NEW_MESSAGE",
  "CALL_CANCELLED",
] as const;

async function main() {
  console.log("Wiping order/call/review history — accounts and catalog data are untouched...\n");

  const notifications = await prisma.notification.deleteMany({ where: { type: { in: [...JOB_NOTIFICATION_TYPES] } } });
  console.log(`  Removed ${notifications.count} job-related notification(s).`);

  const customerWalletTx = await prisma.customerWalletTransaction.deleteMany({ where: { liveCallId: { not: null } } });
  console.log(`  Removed ${customerWalletTx.count} customer wallet transaction(s) tied to an order.`);

  const vendorWalletTx = await prisma.vendorWalletTransaction.deleteMany({ where: { liveCallId: { not: null } } });
  console.log(`  Removed ${vendorWalletTx.count} vendor wallet transaction(s) tied to an order.`);

  // Cascades LiveCallItem, ServiceCall, ServiceCallOffer,
  // ServiceCallHandover, JobPhoto, JobSignature, ServiceReport, Review,
  // ChatMessage — the entire job/call/review graph in one call.
  const liveCalls = await prisma.liveCall.deleteMany({});
  console.log(`  Removed ${liveCalls.count} live call(s) (and everything cascaded from them).`);

  const techRatings = await prisma.technicianProfile.updateMany({ data: { ratingAvg: null, ratingCount: 0 } });
  console.log(`  Reset rating fields on ${techRatings.count} technician profile(s).`);

  const serviceRatings = await prisma.service.updateMany({ data: { ratingAvg: null, ratingCount: 0 } });
  console.log(`  Reset rating fields on ${serviceRatings.count} service(s).`);

  const orderCounters = await prisma.sequenceCounter.updateMany({
    where: { id: { startsWith: "ORDER:" } },
    data: { value: 0 },
  });
  console.log(`  Reset ${orderCounters.count} order ticket-sequence counter(s) to 0.`);

  console.log("\nDone. Accounts, KYC docs, support tickets, and catalog data are untouched.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
