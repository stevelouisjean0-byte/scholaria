/**
 * Auth middleware — canonical Clerk v6 pattern.
 *
 * /dashboard is protected; anonymous visitors redirect to /signin instead of
 * receiving Clerk's default 404. Keys must be present at runtime — if they
 * are not configured, the build still completes but middleware throws on
 * request, which is the loud-fail behaviour we want for an auth surface.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/signin", req.url).toString()
    });
  }
});

export const config = {
  matcher: [
    // Skip Next internals, static assets, the agent health endpoint, and known file types.
    "/((?!_next|api/agents/health|favicon.ico|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf|txt|xml)).*)",
    "/(api|trpc)(.*)"
  ]
};
