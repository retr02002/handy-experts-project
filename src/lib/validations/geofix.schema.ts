import { z } from "zod";

/**
 * A position reading submitted by a technician's device at a job gate.
 * Nullable at the call site (GPS denied/unavailable is a real state the
 * action has to answer for), so this validates the shape only when one is
 * actually present.
 */
export const geoFixSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyM: z.number().min(0).max(100000).nullable().optional(),
});

export type GeoFixInput = z.infer<typeof geoFixSchema>;
