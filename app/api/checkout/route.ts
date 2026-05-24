/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the selected plan + cadence and
 * returns the hosted-checkout URL the client should redirect to.
 *
 *   body: { plan: "graduate" | "doctoral" | "dissertation",
 *           cadence: "monthly" | "annual" }
 *   resp: { url: string }
 *
 * When Clerk is configured and the request is authenticated, the Clerk
 * user id is attached as client_reference_id and the user's email is
 * prefilled, so the webhook can match the resulting subscription back
 * to the right account.
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";
import { clerkEnabled } from "@/lib/clerk-config";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  plan: z.enum(["graduate", "doctoral", "dissertation"]),
  cadence: z.enum(["monthly", "annual"]).default("monthly")
});

async function getUserContext() {
  if (!clerkEnabled) return { userId: null, email: null };
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    if (!user) return { userId: null, email: null };
    return {
      userId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress ?? null
    };
  } catch {
    return { userId: null, email: null };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", detail: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { plan, cadence } = parsed.data;
  const priceId = PRICES[plan]?.[cadence];
  if (!priceId) {
    return NextResponse.json(
      { error: "price_not_configured", plan, cadence },
      { status: 500 }
    );
  }

  const { userId, email } = await getUserContext();
  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?status=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      client_reference_id: userId ?? undefined,
      customer_email: email ?? undefined,
      metadata: { plan, cadence, clerk_user_id: userId ?? "" },
      subscription_data: {
        metadata: { plan, cadence, clerk_user_id: userId ?? "" }
      }
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    return NextResponse.json({ error: "checkout_failed", detail: message }, { status: 502 });
  }
}
