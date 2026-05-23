/**
 * Auth middleware.
 *
 * If Clerk is configured (both publishable + secret keys are present and
 * match the Clerk key format), wrap the request in Clerk's middleware and
 * protect /dashboard. If Clerk is not yet configured, fall through with
 * a no-op so the rest of the site still serves.
 */
import { NextRequest, NextResponse } from "next/server";

const clerkConfigured =
  /^pk_(test|live)_[A-Za-z0-9]/.test(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "") &&
  /^sk_(test|live)_[A-Za-z0-9]/.test(process.env.CLERK_SECRET_KEY ?? "");

// Dynamic import keeps the Clerk runtime out of the bundle when not used.
let cachedHandler: ((req: NextRequest) => Promise<Response | undefined> | Response | undefined) | null = null;

async function getClerkHandler() {
  if (!clerkConfigured) return null;
  if (cachedHandler) return cachedHandler;
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtected = createRouteMatcher(["/dashboard(.*)"]);
  cachedHandler = clerkMiddleware((auth, req) => {
    if (isProtected(req)) auth.protect();
  }) as unknown as typeof cachedHandler;
  return cachedHandler;
}

export default async function middleware(req: NextRequest) {
  const handler = await getClerkHandler();
  if (!handler) return NextResponse.next();
  return (await handler(req)) ?? NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and the public folder.
    "/((?!_next|api/agents/health|.*\\.[^/]+$).*)"
  ]
};
