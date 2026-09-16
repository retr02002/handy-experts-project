import { COMPANY_CODE } from "@/lib/structuredIds";

// Pure formatter/parser for LiveCall's ticket identity — no DB access.
// Legacy orders (predating structured IDs) keep the old "HZ-100234" format
// forever, computed from ticketSeq with a +100000 offset so the first-ever
// order reads like a real order number from day one. Orders with a
// structured id (orderCityCode/orderLocalityCode/orderSeq all set) format
// as "HANDYZONDDW369369" instead — see src/lib/structuredIds.ts and
// src/lib/locationCodes.ts for how those parts are derived and issued.
const LEGACY_PREFIX = "HZ-";
const LEGACY_OFFSET = 100000;

export interface OrderIdParts {
  ticketSeq: number;
  orderCityCode: string | null;
  orderLocalityCode: string | null;
  orderSeq: number | null;
}

export function formatTicketNumber(parts: OrderIdParts): string {
  if (parts.orderSeq == null || !parts.orderCityCode) {
    return `${LEGACY_PREFIX}${LEGACY_OFFSET + parts.ticketSeq}`;
  }
  return `${COMPANY_CODE}${parts.orderCityCode}${parts.orderLocalityCode ?? parts.orderCityCode}${parts.orderSeq}`;
}

export type ParsedTicket =
  | { kind: "legacy"; ticketSeq: number }
  | { kind: "structured"; cityCode: string; areaCode: string; orderSeq: number }
  | null;

/**
 * Accepts either format, for the vendor "search by ticket #" lookup tool.
 * orderSeq is only unique *within* a city (not globally), so a structured
 * match must filter by cityCode + orderSeq together, never orderSeq alone.
 */
export function parseTicketNumber(input: string): ParsedTicket {
  const cleaned = input.trim().toUpperCase();

  const legacy = cleaned.match(/^HZ-?(\d+)$/);
  if (legacy) {
    const seq = Number(legacy[1]) - LEGACY_OFFSET;
    return seq > 0 ? { kind: "legacy", ticketSeq: seq } : null;
  }

  const structured = cleaned.match(new RegExp(`^${COMPANY_CODE}([A-Z]{2})([A-Z]{2})(\\d+)$`));
  if (structured) {
    return { kind: "structured", cityCode: structured[1], areaCode: structured[2], orderSeq: Number(structured[3]) };
  }

  return null;
}
