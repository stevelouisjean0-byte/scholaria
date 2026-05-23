/**
 * Clerk configuration helpers.
 *
 * Clerk's components throw at render time if the publishable key is missing.
 * We treat Clerk as "enabled" only when both keys are present and look like
 * real Clerk keys (pk_test_, pk_live_, sk_test_, sk_live_). When disabled,
 * every Clerk-using surface falls back to the placeholder UX so the site
 * never errors before credentials are configured.
 */

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const sk = process.env.CLERK_SECRET_KEY ?? "";

export const clerkEnabled =
  /^pk_(test|live)_[A-Za-z0-9]/.test(pk) && /^sk_(test|live)_[A-Za-z0-9]/.test(sk);

export const clerkPublishableKey = clerkEnabled ? pk : undefined;
