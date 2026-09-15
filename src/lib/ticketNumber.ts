// Pure formatter/parser for LiveCall.ticketSeq — no DB access, mirrors
// src/lib/pins.ts's shape. The +100000 offset means the first-ever order
// displays as "HZ-100100" rather than "HZ-1", reading like a real order
// number from day one instead of visibly counting up from nothing.
const TICKET_PREFIX = "HZ-";
const TICKET_OFFSET = 100000;

export function formatTicketNumber(seq: number): string {
  return `${TICKET_PREFIX}${TICKET_OFFSET + seq}`;
}

/** Accepts "HZ-100234", "hz-100234", "100234", or with stray whitespace. */
export function parseTicketNumber(input: string): number | null {
  const cleaned = input.trim().toUpperCase().replace(/^HZ-?/, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const displayed = Number(cleaned);
  const seq = displayed - TICKET_OFFSET;
  return seq > 0 ? seq : null;
}
