// Shared pin generator for admin-created live calls — pure and dependency-
// free (Math.random, no Node-only crypto import) so it can run in both the
// browser (live "regenerate" button, bulk-upload preview table) and on the
// server (bulk-confirm re-validation). Not a security secret: it's a
// hand-off code read aloud on-site and gated by servicejob.actions.ts's
// 5-attempt limit, same trust level as the existing 4-digit customer PIN.
//
// Deliberately letters+digits (never pure digits) so an admin-generated
// order PIN can never collide in *form* with a real customer's plain
// numeric PIN — the two are visually distinguishable at a glance. The
// excluded characters (0/O, 1/I/L) avoid the classic handwritten/read-aloud
// mixups.
const PIN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const PIN_LENGTH = 4;

export function generatePin(): string {
  let out = "";
  for (let i = 0; i < PIN_LENGTH; i++) {
    out += PIN_ALPHABET[Math.floor(Math.random() * PIN_ALPHABET.length)];
  }
  return out;
}

export interface PinPair {
  startPin: string;
  completionPin: string;
}

export function generatePinPair(): PinPair {
  const startPin = generatePin();
  let completionPin = generatePin();
  while (completionPin === startPin) completionPin = generatePin();
  return { startPin, completionPin };
}

export const PIN_PATTERN = /^[A-Z0-9]{4,8}$/;
