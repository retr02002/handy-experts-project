import type { RevenueTrendPoint } from "@/components/shared/charts/RevenueTrendChart";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Buckets `rows` into a fixed-length daily trend (oldest to newest, always
 * `days` points even when a day had zero activity) — the shape every
 * revenue/spend chart on the dashboards needs. `getDate`/`getValue` let the
 * same helper serve LiveCall, ServiceCall, or any other row shape.
 */
export function buildDailyTrend<T>(
  rows: T[],
  days: number,
  getDate: (row: T) => string,
  getValue: (row: T) => number
): RevenueTrendPoint[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    keys.push(key);
    buckets.set(key, 0);
  }

  const cutoff = today.getTime() - (days - 1) * DAY_MS;
  for (const row of rows) {
    const rowDate = new Date(getDate(row));
    if (rowDate.getTime() < cutoff) continue;
    const key = rowDate.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + getValue(row));
  }

  return keys.map((key) => {
    const d = new Date(`${key}T00:00:00`);
    return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: buckets.get(key) ?? 0 };
  });
}
