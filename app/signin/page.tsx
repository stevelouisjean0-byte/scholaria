import Image from "next/image";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { HERO_FIGURE } from "@/lib/media";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Scholaria — the autonomous AI dissertation intelligence platform for doctoral and graduate researchers.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: true }
};

export default function SignInPage() {
  return (
    <section className="min-h-screen bg-canvas grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-10">
        <AuthForm mode="signin" />
      </div>
      <aside className="hidden lg:block relative">
        <Image
          src={HERO_FIGURE.src}
          alt={HERO_FIGURE.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/60 via-ink-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="font-serif italic text-[20px] leading-[1.4] max-w-md balance">
            “The feedback read like notes from a methodologist who actually sat with the chapter.”
          </p>
          <p className="mt-4 text-[12.5px] uppercase tracking-[0.24em] text-white/70">
            M. P. · Ed.D. · Vanderbilt Peabody College
          </p>
        </div>
      </aside>
    </section>
  );
}
