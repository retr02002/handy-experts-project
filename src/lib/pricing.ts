// Single source of truth for the tax rate and total computation — previously
// three independent 0.18 literals (livecall.actions.ts, OrderSummaryPanel.tsx,
// CartContainer.tsx) kept in sync only by hand. Now used by both the
// customer-facing display total and the server-charged Razorpay amount, so
// the two are provably identical rather than coincidentally matching.

export const TAX_RATE = 0.18;

export function computeOrderTotal(subtotal: number): { subtotal: number; tax: number; total: number } {
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}

/**
 * What buying one lead costs a vendor, given the order's real total and
 * that vendor's admin-set pricing rule. Lives here (not in livecall.actions.ts,
 * a "use server" file) because every export from a Server Action file must
 * itself be an async function.
 */
export function computeLeadPrice(total: number, type: string, value: number): number {
  const price = type === "PERCENTAGE" ? total * (value / 100) : value;
  return Math.round(price);
}
