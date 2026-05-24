/**
 * Diagnostic endpoint — surfaces the exact Stripe / Clerk / Anthropic
 * failure mode from inside the running platform, where env vars are
 * actually accessible. Gated by a static token; remove after Stripe is
 * reconciled.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATIC_TOKEN = "scholaria-2026-diagnose";

function modeFromKey(v: string | undefined, kind: "pk" | "sk" | "whsec") {
  if (!v) return "MISSING";
  if (kind === "whsec") return v.startsWith("whsec_") ? "ok" : `unexpected (${v.slice(0, 10)})`;
  if (v.startsWith(`${kind}_test_`)) return "test";
  if (v.startsWith(`${kind}_live_`)) return "live";
  return `unexpected (${v.slice(0, 10)})`;
}

function fingerprint(v: string | undefined) {
  if (!v) return { present: false, length: 0 };
  return {
    present: true,
    length: v.length,
    prefix: v.slice(0, 12),
    suffix: v.slice(-6),
    has_whitespace: /\s/.test(v),
    has_quotes: /["']/.test(v),
    is_placeholder: v.includes("NaBcDeFgHi") || v.includes("REPLACE_ME") || v.startsWith("price_1NaB")
  };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== STATIC_TOKEN) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const out: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    summary: {
      stripe_sec_mode: modeFromKey(process.env.STRIPE_SECRET_KEY, "sk"),
      stripe_pub_mode: modeFromKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, "pk"),
      stripe_webhook_mode: modeFromKey(process.env.STRIPE_WEBHOOK_SECRET, "whsec"),
      clerk_pub_mode: modeFromKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, "pk"),
      clerk_sec_mode: modeFromKey(process.env.CLERK_SECRET_KEY, "sk"),
      anthropic_present: Boolean(process.env.ANTHROPIC_API_KEY)
    },
    stripe_secret_fingerprint: fingerprint(process.env.STRIPE_SECRET_KEY),
    price_fingerprints: {
      graduate_monthly: fingerprint(process.env.STRIPE_PRICE_GRADUATE_MONTHLY),
      graduate_annual: fingerprint(process.env.STRIPE_PRICE_GRADUATE_ANNUAL),
      doctoral_monthly: fingerprint(process.env.STRIPE_PRICE_DOCTORAL_MONTHLY),
      doctoral_annual: fingerprint(process.env.STRIPE_PRICE_DOCTORAL_ANNUAL),
      dissertation_monthly: fingerprint(process.env.STRIPE_PRICE_DISSERTATION_MONTHLY),
      dissertation_annual: fingerprint(process.env.STRIPE_PRICE_DISSERTATION_ANNUAL)
    }
  };

  const sk = (process.env.STRIPE_SECRET_KEY ?? "").trim();

  // Network reachability check — can the function even reach api.stripe.com?
  try {
    const t0 = Date.now();
    const ping = await fetch("https://api.stripe.com/v1/charges?limit=1", { method: "GET" });
    out.stripe_network = {
      reachable: true,
      latencyMs: Date.now() - t0,
      statusWithoutAuth: ping.status
    };
  } catch (err) {
    out.stripe_network = {
      reachable: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }

  // Raw fetch with auth — bypasses Stripe SDK to see the actual HTTP response.
  if (sk) {
    try {
      const t0 = Date.now();
      const res = await fetch("https://api.stripe.com/v1/balance", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sk}`,
          "Stripe-Version": "2024-06-20"
        }
      });
      const bodyText = await res.text();
      let parsed: unknown = bodyText;
      try { parsed = JSON.parse(bodyText); } catch { /* keep raw */ }
      out.stripe_auth_test = {
        latencyMs: Date.now() - t0,
        httpStatus: res.status,
        ok: res.ok,
        body: parsed
      };

      // If auth works, list real products + prices
      if (res.ok) {
        const pricesRes = await fetch("https://api.stripe.com/v1/prices?limit=100&active=true", {
          method: "GET",
          headers: { Authorization: `Bearer ${sk}`, "Stripe-Version": "2024-06-20" }
        });
        const pricesJson = await pricesRes.json();
        const productsRes = await fetch("https://api.stripe.com/v1/products?limit=20&active=true", {
          method: "GET",
          headers: { Authorization: `Bearer ${sk}`, "Stripe-Version": "2024-06-20" }
        });
        const productsJson = await productsRes.json();

        out.real_stripe_data = {
          products: (productsJson.data ?? []).map((p: { id: string; name: string; livemode: boolean }) => ({
            id: p.id, name: p.name, livemode: p.livemode
          })),
          prices: (pricesJson.data ?? []).map((p: {
            id: string;
            product: string;
            unit_amount: number;
            currency: string;
            recurring?: { interval: string };
            nickname?: string;
            livemode: boolean;
          }) => ({
            id: p.id,
            product: p.product,
            amount: p.unit_amount,
            currency: p.currency,
            interval: p.recurring?.interval,
            nickname: p.nickname,
            livemode: p.livemode
          }))
        };
      }
    } catch (err) {
      out.stripe_auth_test = {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack?.slice(0, 400) : undefined
      };
    }
  }

  return NextResponse.json(out, { status: 200 });
}
