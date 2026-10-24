import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { errorResponse } from "@/lib/errors";
import { updateSession, type ProxyRoute } from "@/lib/sb/middleware";
import { isRateLimitConfigured } from "@/lib/sb/config";

// Lazy so a missing Upstash config disables rate limiting instead of
// throwing on module load (Redis.fromEnv() requires the env vars).
let ratelimit: Ratelimit | null = null;
function getRatelimit(): Ratelimit | null {
  if (!isRateLimitConfigured()) return null;
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(), // UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
      limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 req/min per key
    });
  }
  return ratelimit;
}

/**
 * The auth slice's step of src/proxy.ts: rate limiting, then the Supabase
 * session refresh and route gating. `route` is the page the request renders
 * and how to let it through; a step before this one (the i18n slice's) passes
 * the page a language URL maps onto.
 */
export async function authProxy(
  request: NextRequest,
  route: ProxyRoute = {
    pathname: request.nextUrl.pathname,
    pass: () => NextResponse.next({ request }),
  },
) {
  const limiter = getRatelimit();

  if (limiter) {
    // Determine a stable per-client key: prefer x-forwarded-for, fall back
    // through proxy headers, finally localhost
    const xff = request.headers.get("x-forwarded-for");
    const ip =
      xff?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "127.0.0.1";
    const key = `ip:${ip}:${route.pathname}`;

    const { success, remaining, limit, reset } = await limiter.limit(key);

    if (!success) {
      const retry = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      // Same { error: { code, message } } contract the route handlers use —
      // a client must not need a special case for the one refusal that comes
      // from the proxy rather than from a handler.
      const res = errorResponse(429, "rate_limited", "Too many requests. Try again shortly.");
      res.headers.set("retry-after", String(retry));
      res.headers.set("x-ratelimit-limit", String(limit));
      res.headers.set("x-ratelimit-remaining", "0");
      return res;
    }

    // Continue to the Supabase session refresh
    const res = await updateSession(request, route);

    // Attach rate-limit headers for observability
    res.headers.set("x-ratelimit-limit", String(limit));
    res.headers.set("x-ratelimit-remaining", String(remaining));

    return res;
  }

  return updateSession(request, route);
}
