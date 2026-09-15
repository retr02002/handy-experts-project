"use client";

import { useEffect, useRef, useState } from "react";

/** Roughly 11 m at Delhi's latitude — below this a "move" is GPS jitter. */
const MIN_ANIMATED_DELTA_DEG = 0.0001;

/** Past this the technician didn't travel, they jumped (or the app resumed). */
const MAX_ANIMATED_DELTA_DEG = 0.05;

export interface LatLng {
  lat: number;
  lng: number;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Eases a marker from where it was to where it now is, so a position that
 * only lands every few seconds reads as continuous movement instead of a
 * teleport. This — not the polling rate — is what makes a tracking map feel
 * like Blinkit or Zomato.
 *
 * Deliberately does NOT animate in three cases:
 *  - the first fix (nothing to move *from*, so it must appear in place)
 *  - sub-`MIN_ANIMATED_DELTA_DEG` changes, which are GPS noise and would
 *    otherwise leave the dot permanently shivering
 *  - jumps beyond `MAX_ANIMATED_DELTA_DEG`, which mean a resumed app or a
 *    reassigned technician; gliding kilometres across the map would be a lie
 *    about a journey that never happened
 *
 * Those three still run through the same animation loop, just at zero
 * duration — one shared path keeps every state write inside a rAF callback
 * rather than the effect body.
 *
 * The returned value is for *rendering only*. Anything that reasons about
 * where the technician actually is — fit-bounds, distance, ETA, deep links —
 * must keep using the real target, or it will report a position the
 * technician is merely part-way toward.
 */
export function useInterpolatedPosition(target: LatLng | null, durationMs: number): LatLng | null {
  const [rendered, setRendered] = useState<LatLng | null>(target);
  const frameRef = useRef<number | null>(null);
  const fromRef = useRef<LatLng | null>(target);

  const targetLat = target?.lat ?? null;
  const targetLng = target?.lng ?? null;

  useEffect(() => {
    if (targetLat === null || targetLng === null) {
      fromRef.current = null;
      return;
    }

    const to: LatLng = { lat: targetLat, lng: targetLng };
    const from = fromRef.current;
    const delta = from ? Math.max(Math.abs(to.lat - from.lat), Math.abs(to.lng - from.lng)) : Infinity;
    const shouldAnimate = !!from && delta >= MIN_ANIMATED_DELTA_DEG && delta <= MAX_ANIMATED_DELTA_DEG;

    const origin = shouldAnimate && from ? from : to;
    const duration = shouldAnimate ? durationMs : 0;
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = duration <= 0 ? 1 : Math.min(1, (now - startedAt) / duration);
      const eased = easeInOutQuad(progress);
      const next: LatLng = {
        lat: origin.lat + (to.lat - origin.lat) * eased,
        lng: origin.lng + (to.lng - origin.lng) * eased,
      };

      fromRef.current = next;
      setRendered(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [targetLat, targetLng, durationMs]);

  // Derived rather than stored, so clearing needs no state write: once the
  // caller passes null there is nothing to draw, whatever the last frame was.
  return target === null ? null : rendered;
}
