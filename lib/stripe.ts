import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
  appInfo: { name: "Scholaria", version: "1.0.0" }
});

export const PRICES = {
  graduate: {
    monthly: process.env.STRIPE_PRICE_GRADUATE_MONTHLY!,
    annual: process.env.STRIPE_PRICE_GRADUATE_ANNUAL!
  },
  doctoral: {
    monthly: process.env.STRIPE_PRICE_DOCTORAL_MONTHLY!,
    annual: process.env.STRIPE_PRICE_DOCTORAL_ANNUAL!
  },
  dissertation: {
    monthly: process.env.STRIPE_PRICE_DISSERTATION_MONTHLY!,
    annual: process.env.STRIPE_PRICE_DISSERTATION_ANNUAL!
  },
  university: { contact: process.env.STRIPE_PRICE_UNIVERSITY! }
};
