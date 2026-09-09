/**
 * One-off: wipes EVERY account except SUPER_ADMIN (customers, vendors,
 * technicians, and any leftover PENDING signups), plus all their order
 * history — for a completely clean testing slate. The user will create
 * their own vendor/technician/customer accounts from here on.
 *
 * Run with: npx tsx prisma/wipe-non-admin-accounts.ts
 *
 * Deliberately NOT touching: SUPER_ADMIN users, the Service/ServicePackage
 * catalog.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Wiping OTP codes, notifications, live calls, and every non-admin account...");

  const otps = await prisma.otpCode.deleteMany({});
  console.log(`  Removed ${otps.count} OTP code row(s).`);

  const notifications = await prisma.notification.deleteMany({});
  console.log(`  Removed ${notifications.count} notification(s).`);

  // Cascades LiveCallItem + any ServiceCall/ServiceCallOffer still linked to them.
  const liveCalls = await prisma.liveCall.deleteMany({});
  console.log(`  Removed ${liveCalls.count} live call(s).`);

  // Cascades every profile (Vendor/Technician), service areas, locations,
  // remaining ServiceCall/ServiceCallOffer rows, Address book, Account/Session
  // rows — everything hanging off these users.
  const users = await prisma.user.deleteMany({ where: { role: { not: "SUPER_ADMIN" } } });
  console.log(`  Removed ${users.count} non-admin user(s).`);

  const remaining = await prisma.user.count();
  console.log(`\nDone. ${remaining} user(s) remain (should be just the SUPER_ADMIN account(s)).`);
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
