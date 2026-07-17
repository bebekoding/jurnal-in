// Lightweight in-memory sliding-window rate limiter.
//
// Note: on serverless (Vercel) each instance keeps its own map and cold
// starts reset it, so this is best-effort throttling of bursts rather than
// a globally-consistent quota. For a 9-person study group that's plenty —
// it stops one client from hammering the API in a tight loop. Swap for a
// Redis/Upstash store if this ever needs to be authoritative.

type Hit = number[]; // timestamps (ms)

const store = new Map<string, Hit>();

export type RateResult = { ok: boolean; retryAfter: number };

/**
 * Allow at most `max` events per `windowMs` for the given key.
 * Returns retryAfter (seconds) when blocked.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= max) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000);
    store.set(key, hits);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }

  hits.push(now);
  store.set(key, hits);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (store.size > 500) {
    for (const [k, v] of store) {
      const live = v.filter((t) => t > cutoff);
      if (live.length === 0) store.delete(k);
      else store.set(k, live);
    }
  }

  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function tooMany(retryAfter: number): Response {
  return new Response(
    `Too many requests. Try again in ${retryAfter}s.`,
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
