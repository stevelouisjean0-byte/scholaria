/**
 * Postgres-backed rate limiter — sliding window per (key, route) pair.
 *
 * Used for public endpoints that invoke expensive backends (Claude API,
 * email send) where unauthenticated abuse would cost real money.
 *
 * Not as fast as Redis but sufficient for sub-100/sec endpoints. Single
 * round-trip per check.
 */
import { db } from "./db";

let tableReady = false;
async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await db.query(`
    create table if not exists rate_limits (
      key text not null,
      route text not null,
      hit_at timestamptz not null default now(),
      primary key (key, route, hit_at)
    )
  `);
  await db.query(`create index if not exists rate_limits_key_idx on rate_limits(key, route, hit_at desc)`);
  tableReady = true;
}

export interface RateLimitInput {
  /** A request-identifying key. Use the IP address. */
  key: string;
  /** Logical route name (e.g. "support", "agents-health"). */
  route: string;
  /** How many requests to allow per window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec?: number;
}

/**
 * Check + record one request. Returns { allowed: true } if under limit,
 * { allowed: false, retryAfterSec } otherwise. Inserts the hit only when
 * allowed so blocked requests don't extend the window.
 */
export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  await ensureTable();
  const key = input.key.trim().slice(0, 200);
  if (!key) return { allowed: false, remaining: 0, retryAfterSec: input.windowSec };

  try {
    const { rows } = await db.query(
      `select count(*)::int as n
         from rate_limits
        where key = $1 and route = $2 and hit_at >= now() - ($3 || ' seconds')::interval`,
      [key, input.route, String(input.windowSec)]
    );
    const used = rows[0]?.n ?? 0;
    if (used >= input.limit) {
      return { allowed: false, remaining: 0, retryAfterSec: input.windowSec };
    }

    await db.query(
      `insert into rate_limits (key, route) values ($1, $2)`,
      [key, input.route]
    );

    // Best-effort housekeeping: trim ancient rows (1 in 50 inserts).
    if (Math.floor(used) % 50 === 0) {
      db.query(
        `delete from rate_limits where hit_at < now() - interval '1 day'`
      ).catch(() => undefined);
    }

    return { allowed: true, remaining: input.limit - used - 1 };
  } catch (err) {
    console.warn("[rate-limit] check failed, allowing:", err);
    return { allowed: true, remaining: input.limit };
  }
}

/**
 * Resolves the caller's IP from common Vercel/proxy headers.
 */
export function callerIp(req: Request | { headers: { get(name: string): string | null } }): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
