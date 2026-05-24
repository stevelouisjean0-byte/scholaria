import Stripe from "stripe";

/**
 * Stripe client.
 *
 * Defensive .trim() on the secret key — Vercel's env-var editor can paste
 * a trailing newline, which makes the Bearer Authorization header malformed
 * and Stripe responds with a generic ConnectionError. Trimming eliminates
 * the failure mode entirely.
 */
const rawSecret = process.env.STRIPE_SECRET_KEY ?? "";
const cleanSecret = rawSecret.trim();

export const stripe = new Stripe(cleanSecret, {
  apiVersion: "2024-06-20",
  appInfo: { name: "Scholaria", version: "1.0.0" }
});

// Same defensive trim on each price ID env var.
function pick(name: string): string {
  return (process.env[name] ?? "").trim();
}

export const PRICES = {
  graduate: {
    monthly: pick("STRIPE_PRICE_GRADUATE_MONTHLY"),
    annual: pick("STRIPE_PRICE_GRADUATE_ANNUAL")
  },
  doctoral: {
    monthly: pick("STRIPE_PRICE_DOCTORAL_MONTHLY"),
    annual: pick("STRIPE_PRICE_DOCTORAL_ANNUAL")
  },
  dissertation: {
    monthly: pick("STRIPE_PRICE_DISSERTATION_MONTHLY"),
    annual: pick("STRIPE_PRICE_DISSERTATION_ANNUAL")
  },
  university: { contact: pick("STRIPE_PRICE_UNIVERSITY") }
};
