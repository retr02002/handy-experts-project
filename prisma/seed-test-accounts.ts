/**
 * One-off: wipes every VENDOR/TECHNICIAN account (and all LiveCall/
 * Notification history) and seeds a clean 2-vendor/4-technician test
 * environment with fixed, known credentials — for testing the full
 * customer -> vendor -> technician -> customer order flow end to end.
 *
 * Run with: npx tsx prisma/seed-test-accounts.ts
 *
 * Deliberately NOT touching: CUSTOMER/SUPER_ADMIN users, the
 * Service/ServicePackage catalog, or the customer Address book.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";
import { forwardGeocodePincode } from "../src/lib/geocode";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PASSWORD = "Test@1234";
const VENDOR_RADIUS_KM = 2;
const TECHNICIAN_RADIUS_KM = 10;

interface VendorSeed {
  pincode: string;
  city: string;
  companyName: string;
  email: string;
  username: string;
  technicians: { username: string; name: string; skillCategory: string }[];
}

const VENDORS: VendorSeed[] = [
  {
    pincode: "110059",
    city: "Dwarka, New Delhi",
    companyName: "Dwarka Home Services",
    email: "vendor.dwarka@test.handyzo.in",
    username: "vendor.dwarka",
    technicians: [
      { username: "tech.dwarka1", name: "Ravi Kumar", skillCategory: "Electrician" },
      { username: "tech.dwarka2", name: "Suresh Yadav", skillCategory: "Plumber" },
    ],
  },
  {
    pincode: "110043",
    city: "Najafgarh, New Delhi",
    companyName: "Najafgarh Home Services",
    email: "vendor.najafgarh@test.handyzo.in",
    username: "vendor.najafgarh",
    technicians: [
      { username: "tech.najafgarh1", name: "Amit Sharma", skillCategory: "AC Technician" },
      { username: "tech.najafgarh2", name: "Deepak Singh", skillCategory: "Cleaner" },
    ],
  },
];

async function wipeVendorsAndTechnicians() {
  console.log("Wiping notifications, live calls, and every VENDOR/TECHNICIAN account...");
  await prisma.notification.deleteMany({});
  await prisma.liveCall.deleteMany({});
  const removed = await prisma.user.deleteMany({ where: { role: { in: ["VENDOR", "TECHNICIAN"] } } });
  console.log(`  Removed ${removed.count} vendor/technician user(s) (cascaded their profiles/service areas/calls).`);
}

async function seedVendor(spec: VendorSeed) {
  const coords = await forwardGeocodePincode(spec.pincode);
  if (!coords) throw new Error(`Could not geocode pincode ${spec.pincode}`);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const vendor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: spec.companyName,
        email: spec.email,
        username: spec.username,
        password: passwordHash,
        role: "VENDOR",
      },
    });
    const profile = await tx.vendorProfile.create({
      data: {
        userId: user.id,
        companyName: spec.companyName,
        companyType: "Sole Proprietorship",
        address: `Test address, ${spec.city}`,
        city: spec.city,
        state: "Delhi",
        pincode: spec.pincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        isActive: true,
        incorporationDate: new Date("2024-01-01"),
      },
    });
    await tx.vendorServiceArea.create({
      data: {
        vendorId: profile.id,
        pincode: spec.pincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: VENDOR_RADIUS_KM,
      },
    });
    return profile;
  });

  console.log(`  Vendor "${spec.companyName}" created (pincode ${spec.pincode}, ${VENDOR_RADIUS_KM}km service area).`);

  for (const t of spec.technicians) {
    const techPasswordHash = await bcrypt.hash(PASSWORD, 10);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: t.name,
          username: t.username,
          password: techPasswordHash,
          role: "TECHNICIAN",
          // Left null on purpose — the technician sets this themselves from
          // /technician/profile, which is what unlocks username+OTP login.
          phone: null,
        },
      });
      const techProfile = await tx.technicianProfile.create({
        data: {
          userId: user.id,
          type: "VENDOR_MANAGED",
          skillCategory: t.skillCategory,
          experienceYears: 4,
          servicePincode: spec.pincode,
          vendorId: vendor.id,
        },
      });
      await tx.technicianServiceArea.create({
        data: {
          technicianId: techProfile.id,
          pincode: spec.pincode,
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusKm: TECHNICIAN_RADIUS_KM,
        },
      });
    });
    console.log(`    Technician "${t.name}" (${t.username}) created under ${spec.companyName}.`);
  }
}

async function main() {
  await wipeVendorsAndTechnicians();

  console.log("\nSeeding vendors + technicians...");
  for (const spec of VENDORS) {
    await seedVendor(spec);
  }

  console.log("\n=== TEST CREDENTIALS ===");
  console.log(`Password for every seeded account: ${PASSWORD}\n`);
  console.log("Vendor login — https://<your-app>/onboarding?role=VENDOR -> \"Log in\" tab (email + password):");
  for (const v of VENDORS) {
    console.log(`  ${v.companyName.padEnd(28)} email: ${v.email}`);
  }
  console.log("\nTechnician login — https://<your-app>/onboarding?role=TECHNICIAN -> \"Log in\" tab (username + password),");
  console.log("or the \"OTP\" tab once that technician has added their real phone number on /technician/profile:");
  for (const v of VENDORS) {
    for (const t of v.technicians) {
      console.log(`  ${t.name.padEnd(20)} username: ${t.username.padEnd(18)} (under ${v.companyName}, skill: ${t.skillCategory})`);
    }
  }
  console.log("\nAll technicians start OFF duty with no phone set — sign in, add a phone on your profile page if you want to test OTP login, then toggle On Duty from the top bar.");
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
