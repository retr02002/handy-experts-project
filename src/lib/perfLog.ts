/**
 * Lightweight timing breakdown for the technician job-action flow
 * (accept/start/complete) — added after two rounds of code-level latency
 * fixes still left "still slow in production" reports with no way to see
 * *where* the time actually goes (DB connection acquisition vs. the query
 * itself vs. something else). These actions are low-frequency (a
 * technician doesn't start/complete jobs hundreds of times a second), so
 * always-on logging here has negligible cost and lets a slow request be
 * diagnosed from production logs instead of guessed at again.
 */
export function createStepTimer(label: string) {
  const start = Date.now();
  let last = start;
  return {
    mark(step: string) {
      const now = Date.now();
      console.log(`[PERF] ${label} — ${step}: ${now - last}ms (total ${now - start}ms)`);
      last = now;
    },
  };
}
