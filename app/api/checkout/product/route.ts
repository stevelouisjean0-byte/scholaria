import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/product
 *
 * Creates a Stripe Checkout Session in PAYMENT mode (one-time) for the
 * selected service. Stripe collects the customer's email and card; on
 * success it redirects to /upload?session_id={CHECKOUT_SESSION_ID} which
 * validates the payment and unlocks a single review credit.
 *
 *   body: { product: ProductSlug, email?: string }
 *   resp: { url: string, sessionId: string }
 */
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const productSlug = String(body.product ?? "");
  const product = getProduct(productSlug);
  if (!product || !product.enabled) {
    return NextResponse.json({ error: "product_not_found", productSlug }, { status: 404 });
  }
  const customerEmail = typeof body.email === "string" ? body.email.trim() : undefined;

  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.positioning
            },
            unit_amount: product.priceCents
          },
          quantity: 1
        }
      ],
      success_url: `${origin}/upload?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?status=cancelled`,
      customer_email: customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        product_slug: product.slug,
        product_name: product.name,
        word_cap: String(product.wordCap)
      },
      payment_intent_data: {
        metadata: {
          product_slug: product.slug,
          product_name: product.name
        }
      }
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    return NextResponse.json({ error: "checkout_failed", detail: message }, { status: 502 });
  }
}
