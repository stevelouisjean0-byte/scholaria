"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerk-config";

/**
 * Right-side header auth controls.
 * - When Clerk is enabled and the user is signed out: same Sign in + Get started CTAs.
 * - When Clerk is enabled and the user is signed in: avatar menu with sign-out + manage account.
 * - When Clerk is NOT enabled: pure links — placeholder auth pages handle the rest.
 */
export function ClerkHeaderAuth() {
  if (!clerkEnabled) {
    return (
      <>
        <Link href="/signin" className="text-ink-700 hover:text-ink-950">Sign in</Link>
        <Link
          href="/signup"
          className="inline-flex items-center h-8 px-3.5 rounded-full bg-ink-900 text-white hover:bg-ink-800 transition text-[13px]"
        >
          Get started
        </Link>
      </>
    );
  }

  return (
    <>
      <SignedOut>
        <Link href="/signin" className="text-ink-700 hover:text-ink-950">Sign in</Link>
        <Link
          href="/signup"
          className="inline-flex items-center h-8 px-3.5 rounded-full bg-ink-900 text-white hover:bg-ink-800 transition text-[13px]"
        >
          Get started
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard" className="text-ink-700 hover:text-ink-950">Dashboard</Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-1 ring-ink-200"
            }
          }}
        />
      </SignedIn>
    </>
  );
}
