import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  await db.query(
    "insert into billing_events (id, type, payload, received_at) values ($1,$2,$3,now()) on conflict (id) do nothing",
    [event.id, event.type, event.data.object]
  );

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.paid":
    case "invoice.payment_failed":
      // Pricing & Payment Agent handles the billing-side reconciliation
      // through its own queue consumer; we just need a durable ledger here.
      break;
  }

  return NextResponse.json({ received: true });
}
