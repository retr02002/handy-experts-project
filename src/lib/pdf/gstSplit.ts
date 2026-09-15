export interface GstSplit {
  cgst: number;
  sgst: number;
  igst: number;
  /** True when supplier and customer are in different states. */
  interState: boolean;
}

/**
 * The schema carries one `tax` scalar, but an Indian tax invoice has to
 * show either CGST+SGST (supplier and customer in the same state) or IGST
 * (different states). Place of supply is decided by comparing the biller's
 * state with the customer's.
 *
 * Deliberately conservative: when either state is unknown we assume
 * intra-state and split 50/50, because that's the common case for a local
 * home-services job and it's better than printing a zero tax line.
 */
export function splitGst(tax: number, billerState: string | null, customerState: string | null): GstSplit {
  const amount = Math.max(0, Math.round(tax * 100) / 100);

  const normalize = (s: string | null) => (s ?? "").trim().toLowerCase();
  const a = normalize(billerState);
  const b = normalize(customerState);
  const interState = a.length > 0 && b.length > 0 && a !== b;

  if (interState) return { cgst: 0, sgst: 0, igst: amount, interState: true };

  const half = Math.round((amount / 2) * 100) / 100;
  // Any rounding remainder goes to CGST so the two halves always re-add to
  // exactly the original tax — a one-paisa mismatch on a tax document is
  // the kind of thing an auditor notices.
  return { cgst: Math.round((amount - half) * 100) / 100, sgst: half, igst: 0, interState: false };
}
