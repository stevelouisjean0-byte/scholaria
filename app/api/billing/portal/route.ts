/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for the signed-in user and
 * returns the hosted-portal URL the client should redirect to. Requires
 * a clerk user; reads the stripe_customer_id from the subscriptions
 * table for that user.
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { clerkEnabled } from "@/lib/clerk-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!clerkEnabled) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  let userId: string | null = null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: id } = await auth();
    userId = id ?? null;
  } catch (err) {
    return NextResponse.json({ error: "auth_failed" }, { status: 500 });
  }
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let customerId: string | null = null;
  try {
    const { rows } = await db.query(
      `select stripe_customer_id from subscriptions
       where clerk_user_id = $1 and stripe_customer_id is not null
       order by updated_at desc limit 1`,
      [userId]
    );
    customerId = rows[0]?.stripe_customer_id ?? null;
  } catch {
    // DB unavailable — fall through, we'll return a helpful 404 below.
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "no_subscription", detail: "No Stripe customer found for this account." },
      { status: 404 }
    );
  }

  const origin = new URL(req.url).origin;
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/billing`
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown Stripe error";
    return NextResponse.json({ error: "portal_failed", detail }, { status: 502 });
  }
}
