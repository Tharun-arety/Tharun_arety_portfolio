/**
 * Spend brakes for a public endpoint that spends a real API key.
 *
 * Two counters, both in the memory of a single serverless instance. Their
 * limits are real and worth stating rather than discovering: a deployment
 * running several instances enforces each cap per instance, and a cold start
 * resets it. That makes these a **spend brake, not a security control**. The
 * honest fix is Upstash or Vercel KV; the honest interim is saying so here,
 * and saying so in the interface too.
 *
 * The per-minute limit bounds one visitor. The daily ceiling bounds the worst
 * day — someone posting the link somewhere busy — and when it trips the agent
 * degrades to the recorded traces rather than to an error. That fallback is a
 * designed state, not a failure: the site already contains six real agent turns
 * that cost nothing to serve.
 *
 * Adapted from `Agent_Architecture_model/lib/rate-limit.ts`.
 */

const windows = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

export type RateVerdict = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export function checkRateLimit(key: string, limit: number): RateVerdict {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > limit) return { allowed: false, remaining: 0, retryAfterSeconds };
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds };
}

/** Best-effort client identity. Behind Vercel the leftmost `x-forwarded-for`
 *  entry is the real client; direct hits share a bucket, which errs toward
 *  limiting too much rather than too little. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Housekeeping: without this the map grows for the instance's lifetime. */
export function sweep(): void {
  const now = Date.now();
  for (const [key, window] of windows) {
    if (now >= window.resetAt) windows.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Daily ceiling
// ---------------------------------------------------------------------------

let day = utcDay();
let served = 0;

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export type CeilingVerdict = { allowed: boolean; served: number; ceiling: number };

/** Call once per accepted request, after the guardrails and before the model. */
export function consumeDailyBudget(ceiling: number): CeilingVerdict {
  const today = utcDay();
  if (today !== day) {
    day = today;
    served = 0;
  }
  if (served >= ceiling) return { allowed: false, served, ceiling };
  served += 1;
  return { allowed: true, served, ceiling };
}

/** Read-only, for the health endpoint and the interface's own disclosure. */
export function budgetStatus(ceiling: number): CeilingVerdict {
  if (utcDay() !== day) return { allowed: true, served: 0, ceiling };
  return { allowed: served < ceiling, served, ceiling };
}
