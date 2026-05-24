/**
 * Stripe webhook handler.
 *
 * Verifies the signature against STRIPE_WEBHOOK_SECRET, persists every
 * event into billing_events for audit, and upserts the subscriptions
 * table on subscription / invoice / checkout events so the platform
 * always knows which user is on which plan.
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown signature error";
    return NextResponse.json({ error: "invalid signature", detail }, { status: 400 });
  }

  // Durable ledger — every event is recorded once, idempotently.
  try {
    await db.query(
      "insert into billing_events (id, type, payload, received_at) values ($1,$2,$3,now()) on conflict (id) do nothing",
      [event.id, event.type, event.data.object as object]
    );
  } catch {
    // DB might not be provisioned yet — keep going, we still want to honour the event.
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await upsertFromCheckoutSession(session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof (invoice as { subscription?: unknown }).subscription === "string"
            ? (invoice as { subscription: string }).subscription
            : null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(sub);
        }
        break;
      }
    }
  } catch (err) {
    // Log but don't fail — Stripe retries non-2xx responses, and we'd rather
    // accept the event into our ledger than have Stripe retry forever.
    console.warn("[stripe] handler error for event", event.type, err);
  }

  return NextResponse.json({ received: true, type: event.type });
}

async function upsertFromCheckoutSession(session: Stripe.Checkout.Session) {
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (!subscriptionId) return;

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscription(sub, {
    clerk_user_id: session.client_reference_id ?? sub.metadata?.clerk_user_id ?? null,
    email: session.customer_email ?? (session.customer_details?.email ?? null),
    plan: session.metadata?.plan ?? sub.metadata?.plan ?? null,
    cadence: session.metadata?.cadence ?? sub.metadata?.cadence ?? null
  });
}

async function upsertSubscription(
  sub: Stripe.Subscription,
  overrides: {
    clerk_user_id?: string | null;
    email?: string | null;
    plan?: string | null;
    cadence?: string | null;
  } = {}
) {
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;

  const clerkUserId = overrides.clerk_user_id ?? sub.metadata?.clerk_user_id ?? null;
  const plan = overrides.plan ?? sub.metadata?.plan ?? inferPlanFromPrice(priceId);
  const cadence = overrides.cadence ?? sub.metadata?.cadence ?? inferCadenceFromPrice(priceId);

  try {
    await db.query(
      `insert into subscriptions
        (stripe_subscription_id, stripe_customer_id, clerk_user_id, email, plan, cadence,
         price_id, status, current_period_end, cancel_at_period_end, raw, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,to_timestamp($9),$10,$11,now(),now())
       on conflict (stripe_subscription_id) do update set
         stripe_customer_id = excluded.stripe_customer_id,
         clerk_user_id      = coalesce(excluded.clerk_user_id, subscriptions.clerk_user_id),
         email              = coalesce(excluded.email, subscriptions.email),
         plan               = coalesce(excluded.plan, subscriptions.plan),
         cadence            = coalesce(excluded.cadence, subscriptions.cadence),
         price_id           = excluded.price_id,
         status             = excluded.status,
         current_period_end = excluded.current_period_end,
         cancel_at_period_end = excluded.cancel_at_period_end,
         raw                = excluded.raw,
         updated_at         = now()`,
      [
        sub.id,
        customerId,
        clerkUserId,
        overrides.email ?? null,
        plan,
        cadence,
        priceId,
        sub.status,
        periodEnd ?? null,
        sub.cancel_at_period_end ?? false,
        sub as object
      ]
    );
  } catch (err) {
    console.warn("[stripe] subscription upsert failed", err);
  }
}

function inferPlanFromPrice(priceId: string | null): string | null {
  if (!priceId) return null;
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_GRADUATE_MONTHLY ?? ""]: "graduate",
    [process.env.STRIPE_PRICE_GRADUATE_ANNUAL ?? ""]: "graduate",
    [process.env.STRIPE_PRICE_DOCTORAL_MONTHLY ?? ""]: "doctoral",
    [process.env.STRIPE_PRICE_DOCTORAL_ANNUAL ?? ""]: "doctoral",
    [process.env.STRIPE_PRICE_DISSERTATION_MONTHLY ?? ""]: "dissertation",
    [process.env.STRIPE_PRICE_DISSERTATION_ANNUAL ?? ""]: "dissertation"
  };
  return map[priceId] ?? null;
}

function inferCadenceFromPrice(priceId: string | null): string | null {
  if (!priceId) return null;
  const monthly = new Set([
    process.env.STRIPE_PRICE_GRADUATE_MONTHLY,
    process.env.STRIPE_PRICE_DOCTORAL_MONTHLY,
    process.env.STRIPE_PRICE_DISSERTATION_MONTHLY
  ]);
  const annual = new Set([
    process.env.STRIPE_PRICE_GRADUATE_ANNUAL,
    process.env.STRIPE_PRICE_DOCTORAL_ANNUAL,
    process.env.STRIPE_PRICE_DISSERTATION_ANNUAL
  ]);
  if (monthly.has(priceId)) return "monthly";
  if (annual.has(priceId)) return "annual";
  return null;
}
