/**
 * Storefront rating display, from one place.
 *
 * A service carries two rating sources: `ratingAvg`/`ratingCount`, recomputed
 * from real customer reviews, and the older admin-typed `rating` string like
 * `"4.9 (12,480 reviews)"`. Real reviews win as soon as there's at least one;
 * until then the admin string keeps cards from going blank on day one.
 */
export interface ResolvedRating {
  /** The number to put next to the star, e.g. "4.8". Null when nothing is known. */
  score: string | null;
  /** The parenthetical, e.g. "(12 reviews)". Null when there's nothing to say. */
  countLabel: string | null;
  /** Numeric score for star rendering / filtering. Null when nothing is known. */
  value: number | null;
  /** True when this came from real customer reviews rather than the admin string. */
  isLive: boolean;
}

export function resolveServiceRating(service: {
  rating?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
}): ResolvedRating {
  const count = service.ratingCount ?? 0;

  if (count > 0 && service.ratingAvg != null) {
    return {
      score: service.ratingAvg.toFixed(1),
      countLabel: `(${count.toLocaleString("en-IN")} ${count === 1 ? "review" : "reviews"})`,
      value: service.ratingAvg,
      isLive: true,
    };
  }

  const legacy = service.rating?.trim();
  if (!legacy) return { score: null, countLabel: null, value: null, isLive: false };

  const score = legacy.split(" ")[0];
  const parsed = parseFloat(score);
  const parenIndex = legacy.indexOf("(");

  return {
    score: Number.isNaN(parsed) ? null : score,
    countLabel: parenIndex >= 0 ? legacy.slice(parenIndex) : null,
    value: Number.isNaN(parsed) ? null : parsed,
    isLive: false,
  };
}
