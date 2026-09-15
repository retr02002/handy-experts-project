import { prisma } from "@/lib/prisma";

/**
 * Resolves whatever a technician typed into the login box to their account.
 *
 * Technicians are created by their vendor, who relays the credentials by
 * hand or SMS, so the one thing a technician reliably knows is their own
 * phone number — the auto-generated username is easy to lose. Accepting
 * either keeps them out of a dead end.
 *
 * Lives in lib rather than in the OTP action because both the "send me a
 * code" action and NextAuth's `otp-technician` provider have to resolve the
 * identifier the same way; if they ever disagreed, a code could be sent to
 * one account and redeemed against another.
 */
export async function findTechnicianByIdentifier(
  identifier: string
): Promise<{ id: string; phone: string | null } | null> {
  const value = identifier.trim();
  if (!value) return null;

  // A 10-digit Indian mobile can't collide with the username format
  // (4-20 chars, and usernames are never all-digits starting 6-9), so the
  // two lookups are unambiguous.
  const isPhone = /^[6-9]\d{9}$/.test(value);

  const user = await prisma.user.findFirst({
    where: {
      role: "TECHNICIAN",
      ...(isPhone ? { phone: value } : { username: value.toLowerCase() }),
    },
    select: { id: true, phone: true },
  });

  return user;
}
