"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { ClerkHeaderAuth } from "@/components/auth/clerk-header-auth";

const NAV = [
  ["How it works", "/how-it-works"],
  ["Sample review", "/sample-review"],
  ["Reviews", "/reviews"],
  ["Pricing", "/pricing"],
  ["Enterprise", "/enterprise"]
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-ink-900/90 sticky top-0 z-40">
      {/* Slim imprint line — quiet reassurance strip, NYC anchor. */}
      <div className="border-b border-ink-200">
        <div className="container py-1.5 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-ink-500">
          <span>Dissertation Editing Center · NYC · NJ · CT</span>
          <span className="hidden sm:inline">From $29 per review · 24-hour delivery · 14-day money-back</span>
          <Link href="/pricing" className="text-ink-900 hover:underline underline-offset-4">
            Order a review →
          </Link>
        </div>
      </div>

      {/* Masthead wordmark + navigation. */}
      <div className="container py-5 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-serif text-[24px] leading-none tracking-[-0.01em] text-ink-900">
            Dissertation Editing Center
          </span>
          <span className="hidden xl:inline font-serif italic text-[14px] text-ink-500">
            formerly Scholaria
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[13.5px] text-ink-800">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-ink-950">{label}</Link>
          ))}
          <span className="h-4 w-px bg-ink-200" />
          <ClerkHeaderAuth />
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-ink-900 text-white text-[13px] font-medium hover:bg-ink-950 transition"
          >
            Order a review
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </nav>

        <button
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-ink-50"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink-200 bg-white">
          <div className="container py-3 flex flex-col">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="py-2.5 text-[14px] text-ink-800">
                {label}
              </Link>
            ))}
            <Link href="/signin" onClick={() => setOpen(false)} className="py-2.5 text-[14px] text-ink-800 border-t border-ink-100">
              Sign in
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center h-10 rounded-full bg-ink-900 text-white text-[14px]"
            >
              Order a review — from $29
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
