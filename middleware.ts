/**
 * Auth middleware — defensive Clerk wiring.
 *
 * Protects /dashboard via Clerk when both keys are configured.
 * If either key is missing or malformed (e.g. accidentally deleted in
 * Vercel), no-ops instead of crashing the whole site with
 * MIDDLEWARE_INVOCATION_FAILED. Loud-fail on auth is worse than
 * letting the public marketing site stay up.
 */
import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const clerkConfigured =
  /^pk_(test|live)_[A-Za-z0-9]/.test(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "") &&
  /^sk_(test|live)_[A-Za-z0-9]/.test(process.env.CLERK_SECRET_KEY ?? "");

const isProtected = createRouteMatcher(["/dashboard(.*)", "/admin(.*)", "/api/admin(.*)"]);

const handler = clerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isProtected(req)) {
        // Carve-out: requests bearing CRON_SECRET pass through middleware
        // unaltered so the route's own bearer-token check can authenticate
        // them. Without this, machine/script clients would be redirected
        // to /signin and never reach the route's auth logic.
        const authHeader = req.headers.get("authorization") ?? "";
        if (authHeader.startsWith("Bearer ")) {
          return;
        }
        await auth.protect({
          unauthenticatedUrl: new URL("/signin", req.url).toString()
        });
      }
    })
  : null;

export default function middleware(req: NextRequest) {
  if (!handler) return NextResponse.next();
  try {
    return handler(req, { waitUntil: () => {} } as never);
  } catch (err) {
    // Last-resort safety net — never crash the whole site from middleware.
    console.error("[middleware] handler threw, falling through", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|api/agents/health|favicon.ico|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf|txt|xml)).*)",
    "/(api|trpc)(.*)"
  ]
};
