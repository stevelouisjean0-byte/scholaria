import Image from "next/image";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { ClerkSignUp } from "@/components/auth/clerk-mounts";
import { PAGE_HEROES } from "@/lib/media";
import { clerkEnabled } from "@/lib/clerk-config";

export const metadata: Metadata = {
  title: "Request early access",
  description:
    "Join the Scholaria early-access list. Be notified the day account creation opens for doctoral candidates and institutional administrators.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: true }
};

/**
 * Catch-all route so Clerk's intermediate flows resolve here:
 * /signup/sso-callback, /signup/verify-email, /signup/factor-one, etc.
 */
export default function SignUpPage() {
  return (
    <section className="min-h-screen bg-canvas grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-10">
        {clerkEnabled ? <ClerkSignUp /> : <AuthForm mode="signup" />}
      </div>
      <aside className="hidden lg:block relative">
        <Image
          src={PAGE_HEROES.enterprise.src}
          alt={PAGE_HEROES.enterprise.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/60 via-ink-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="font-serif italic text-[20px] leading-[1.4] max-w-md balance">
            “The first AI tool I have trusted with an unpublished dissertation chapter. It critiques,
            it does not write.”
          </p>
          <p className="mt-4 text-[12.5px] uppercase tracking-[0.24em] text-white/70">
            A. C. · Ph.D. · Stanford Graduate School of Education
          </p>
        </div>
      </aside>
    </section>
  );
}
