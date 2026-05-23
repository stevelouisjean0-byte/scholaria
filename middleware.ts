/**
 * Auth middleware.
 *
 * Uses Clerk's canonical v6 matcher pattern (covers app routes and api/trpc).
 * `/dashboard(.*)` is protected — unauthenticated visitors are redirected to
 * /signin instead of the default Clerk 404. If Clerk is not configured at
 * runtime, the middleware no-ops so the rest of the site still serves.
 */
import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const clerkConfigured =
  /^pk_(test|live)_[A-Za-z0-9]/.test(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "") &&
  /^sk_(test|live)_[A-Za-z0-9]/.test(process.env.CLERK_SECRET_KEY ?? "");

const isProtected = createRouteMatcher(["/dashboard(.*)"]);

const handler = clerkMiddleware((auth, req) => {
  if (isProtected(req)) {
    auth.protect({
      unauthenticatedUrl: new URL("/signin", req.url).toString()
    });
  }
});

export default function middleware(req: NextRequest) {
  if (!clerkConfigured) return NextResponse.next();
  return handler(req, { waitUntil: () => {} } as never);
}

export const config = {
  matcher: [
    // Skip Next internals, static assets, the agent health endpoint, and known file types.
    "/((?!_next|api/agents/health|favicon.ico|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf|txt|xml)).*)",
    "/(api|trpc)(.*)"
  ]
};
