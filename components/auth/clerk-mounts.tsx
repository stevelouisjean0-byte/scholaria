"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

/**
 * Thin wrappers around Clerk's prebuilt sign-in / sign-up components,
 * styled to match the Scholaria editorial register. Imported only when
 * `clerkEnabled` is true so the bundle does not load Clerk for visitors
 * who never reach an auth route.
 */

const APPEARANCE = {
  variables: {
    colorPrimary: "#0b0e16",
    colorText: "#171b27",
    colorTextSecondary: "#5b6478",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#171b27",
    borderRadius: "12px",
    fontFamily: "Inter, system-ui, sans-serif"
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-elev2 ring-1 ring-ink-100 rounded-2xl",
    headerTitle: "font-semibold text-[22px]",
    headerSubtitle: "text-[13.5px] text-ink-600",
    formButtonPrimary: "rounded-full bg-ink-900 hover:bg-ink-800 text-white normal-case",
    socialButtonsBlockButton: "rounded-xl ring-1 ring-ink-200 hover:bg-ink-50",
    formFieldInput: "rounded-xl ring-1 ring-ink-200 focus:ring-ink-900",
    footerActionLink: "text-ink-900 hover:underline"
  }
};

export function ClerkSignIn() {
  return (
    <SignIn
      appearance={APPEARANCE}
      path="/signin"
      routing="path"
      signUpUrl="/signup"
      fallbackRedirectUrl="/dashboard"
    />
  );
}

export function ClerkSignUp() {
  return (
    <SignUp
      appearance={APPEARANCE}
      path="/signup"
      routing="path"
      signInUrl="/signin"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
