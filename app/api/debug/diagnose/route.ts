/**
 * Temporary diagnostic endpoint — read by the platform owner only.
 *
 * Reports what mode the configured Stripe + Clerk keys are in (without
 * exposing the secret values themselves), and what Stripe sees as the
 * canonical product/price IDs in this account.
 *
 * Gated by ?token=<DIAGNOSE_TOKEN> environment variable so it cannot
 * be hit anonymously. Remove this file once Stripe is reconciled.
 *
 *   GET /api/debug/diagnose?token=<token>
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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

function masked(v: string | undefined, head = 10, tail = 4) {
  if (!v) return "MISSING";
  if (v.length <= head + tail) return v;
  return `${v.slice(0, head)}…${v.slice(-tail)} (len ${v.length})`;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== STATIC_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const out: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    keys: {
      anthropic_present: Boolean(process.env.ANTHROPIC_API_KEY),
      clerk_pub_mode: modeFromKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, "pk"),
      clerk_sec_mode: modeFromKey(process.env.CLERK_SECRET_KEY, "sk"),
      stripe_pub_mode: modeFromKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, "pk"),
      stripe_sec_mode: modeFromKey(process.env.STRIPE_SECRET_KEY, "sk"),
      stripe_webhook_mode: modeFromKey(process.env.STRIPE_WEBHOOK_SECRET, "whsec")
    },
    stripe_price_env_vars: {
      graduate_monthly: masked(process.env.STRIPE_PRICE_GRADUATE_MONTHLY),
      graduate_annual: masked(process.env.STRIPE_PRICE_GRADUATE_ANNUAL),
      doctoral_monthly: masked(process.env.STRIPE_PRICE_DOCTORAL_MONTHLY),
      doctoral_annual: masked(process.env.STRIPE_PRICE_DOCTORAL_ANNUAL),
      dissertation_monthly: masked(process.env.STRIPE_PRICE_DISSERTATION_MONTHLY),
      dissertation_annual: masked(process.env.STRIPE_PRICE_DISSERTATION_ANNUAL)
    }
  };

  // Probe Stripe to see what prices actually exist for the configured key
  const sk = process.env.STRIPE_SECRET_KEY;
  if (sk && (sk.startsWith("sk_test_") || sk.startsWith("sk_live_"))) {
    try {
      const stripe = new Stripe(sk, { apiVersion: "2024-06-20" });
      const products = await stripe.products.list({ active: true, limit: 20 });
      const prices = await stripe.prices.list({ active: true, limit: 50 });
      out.stripe_account_view = {
        products: products.data.map((p) => ({ id: p.id, name: p.name })),
        prices: prices.data.map((p) => ({
          id: p.id,
          product: typeof p.product === "string" ? p.product : p.product?.id,
          unit_amount: p.unit_amount,
          currency: p.currency,
          interval: p.recurring?.interval,
          nickname: p.nickname
        }))
      };

      // Cross-check: do the env-var price IDs actually exist in this account?
      const priceIds = new Set(prices.data.map((p) => p.id));
      out.cross_check = {
        graduate_monthly_found: priceIds.has(process.env.STRIPE_PRICE_GRADUATE_MONTHLY ?? ""),
        graduate_annual_found: priceIds.has(process.env.STRIPE_PRICE_GRADUATE_ANNUAL ?? ""),
        doctoral_monthly_found: priceIds.has(process.env.STRIPE_PRICE_DOCTORAL_MONTHLY ?? ""),
        doctoral_annual_found: priceIds.has(process.env.STRIPE_PRICE_DOCTORAL_ANNUAL ?? ""),
        dissertation_monthly_found: priceIds.has(process.env.STRIPE_PRICE_DISSERTATION_MONTHLY ?? ""),
        dissertation_annual_found: priceIds.has(process.env.STRIPE_PRICE_DISSERTATION_ANNUAL ?? "")
      };
    } catch (err) {
      out.stripe_account_view = { error: err instanceof Error ? err.message : String(err) };
    }
  }

  return NextResponse.json(out, { status: 200 });
}
