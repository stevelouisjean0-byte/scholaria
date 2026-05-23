"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  ["Services", "/services"],
  ["How it works", "/how-it-works"],
  ["Enterprise", "/enterprise"],
  ["Pricing", "/pricing"],
  ["About", "/about"],
  ["FAQ", "/faq"]
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-ink-900/90">
      {/* Slim imprint line — sits above the masthead like an academic
          journal's running head. */}
      <div className="border-b border-ink-200">
        <div className="container py-1.5 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-ink-500">
          <span>Vol. I · No. 1 · Doctoral Edition</span>
          <span className="hidden sm:inline">Issued continuously · Open to scholars</span>
          <Link href="/upload" className="text-ink-900 hover:underline underline-offset-4">
            Submit manuscript →
          </Link>
        </div>
      </div>

      {/* Masthead wordmark + navigation, set in two rows like a printed paper. */}
      <div className="container py-5 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-serif text-[28px] leading-none tracking-[-0.01em] text-ink-900">
            Scholaria
          </span>
          <span className="hidden sm:inline font-serif italic text-[15px] text-ink-500">
            a review of doctoral writing
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[13.5px] text-ink-800">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-ink-950">{label}</Link>
          ))}
          <span className="h-4 w-px bg-ink-200" />
          <Link href="/dashboard" className="text-ink-700 hover:text-ink-950">Sign in</Link>
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
            <Link href="/dashboard" onClick={() => setOpen(false)} className="py-2.5 text-[14px] text-ink-800 border-t border-ink-100">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
