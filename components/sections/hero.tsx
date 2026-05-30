"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HERO_FIGURE } from "@/lib/media";

export function Hero() {
  return (
    <section className="bg-hero">
      <div className="container pt-12 pb-20 lg:pt-20 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="max-w-4xl"
        >
          {/* Quiet eyebrow — masthead register, no marketing chip. */}
          <div className="text-[11px] uppercase tracking-[0.32em] text-ink-500">
            Vol. I · No. 1 · Issued continuously · NYC · NJ · CT
          </div>
          <div className="mt-3 h-px w-12 bg-ink-300" aria-hidden />

          {/* Serif H1 — premium academic register, evocative and short. */}
          <h1 className="mt-8 h-display-serif text-[44px] sm:text-[56px] lg:text-[68px] leading-[1.04]">
            Your dissertation,
            <br className="hidden sm:inline" />
            <span className="italic"> reviewed by morning.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-[18px] leading-[1.6] text-ink-700 pretty">
            Methodology alignment, APA&nbsp;7 verification, citation cross-check, and a 0–100
            submission readiness score — delivered overnight to your inbox.
            <span className="block mt-3 text-ink-900 font-medium">
              First chapter review is free. For Ph.D., Ed.D., and DBA candidates.
            </span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/upload" className="btn-primary">
              Upload a chapter — free
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/sample-review" className="btn-secondary">
              See a sample review
            </Link>
          </div>

          {/* Quiet reassurance row — three signals in a single line under the CTAs. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-medium text-ink-900">$0</span> first review
            </span>
            <span className="hidden sm:inline-block w-px h-3.5 bg-ink-200" />
            <span className="inline-flex items-center gap-1.5">
              <span className="font-medium text-ink-900">24-hour</span> turnaround
            </span>
            <span className="hidden sm:inline-block w-px h-3.5 bg-ink-200" />
            <span className="inline-flex items-center gap-1.5">
              <span className="font-medium text-ink-900">14-day</span> money-back guarantee
            </span>
            <span className="hidden sm:inline-block w-px h-3.5 bg-ink-200" />
            <span className="inline-flex items-center gap-1.5 text-ink-500">
              We critique, never author.
            </span>
          </div>

          {/* Trust microbar */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-600">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-ink-400" />
              Encrypted uploads · FERPA-aware
            </span>
            <span className="hidden sm:inline-block w-px h-4 bg-ink-200" />
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-ink-400" />
              Academic integrity first
            </span>
            <span className="hidden sm:inline-block w-px h-4 bg-ink-200" />
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-ink-400" />
              PDF &amp; DOCX
            </span>
            <span className="hidden sm:inline-block w-px h-4 bg-ink-200" />
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-ink-400" />
              Institutional SSO available
            </span>
          </div>
        </motion.div>

        {/* Hero product card */}
        <HeroProductCard />
      </div>
    </section>
  );
}

function HeroProductCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
      className="mt-14 lg:mt-20 relative"
    >
      <div className="card overflow-hidden">
        <div className="grid grid-cols-12">
          {/* Left rail — workflow status */}
          <aside className="col-span-12 lg:col-span-3 border-r border-ink-100 bg-ink-50/60 p-6">
            <div className="eyebrow-soft">Active review</div>
            <div className="mt-2 font-mono text-[12px] text-ink-500">ms_pra72example</div>
            <h3 className="mt-4 font-semibold text-[15.5px] text-ink-900 leading-snug">
              Dissertation Ch. 3 — Methodology
            </h3>
            <p className="text-[12.5px] text-ink-500 mt-1">M. Patel · Ed.D. · 32 pages</p>

            <div className="mt-6">
              <div className="flex items-baseline justify-between text-[12px] text-ink-600">
                <span>Pipeline progress</span>
                <span className="tabular text-ink-900 font-semibold">84%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full bg-accent-500" style={{ width: "84%" }} />
              </div>
            </div>

            <ul className="mt-6 space-y-2.5">
              {[
                ["Lead Intake", "complete", "success"],
                ["Project Scoping", "complete", "success"],
                ["Professional Editor", "9 findings", "live"],
                ["Research Support", "in progress", "live"],
                ["QA & Final Approval", "queued", "idle"]
              ].map(([name, status, kind]) => (
                <li key={name as string} className="flex items-center justify-between">
                  <span className="text-[13px] text-ink-800">{name}</span>
                  <span className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
                    <span
                      className={
                        kind === "success" ? "dot-live bg-emerald-500" :
                        kind === "live" ? "dot-live" :
                        "dot-idle"
                      }
                    />
                    {status}
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Center — annotated manuscript page */}
          <article className="col-span-12 lg:col-span-6 p-6 lg:p-8 border-r border-ink-100">
            <div className="flex items-center justify-between">
              <div className="eyebrow-soft">Manuscript · p. 12</div>
              <span className="pill-warn">1 major · 2 moderate</span>
            </div>
            <h3 className="mt-3 font-serif text-[22px] text-ink-900 leading-snug">
              Transformational Leadership and Adaptive Capacity in Hybrid Schools
            </h3>

            <div className="mt-6 space-y-4 text-[14.5px] leading-[1.7] text-ink-800">
              <p>
                Although the framework introduced in Chapter 1 anchors the inquiry in transformational
                leadership theory,{" "}
                <mark className="bg-amber-100 ring-1 ring-amber-500/30 rounded px-1 py-0.5">
                  the present chapter shifts to a thematic treatment of empirical studies
                </mark>{" "}
                without re-stating how the framework should organise the synthesis that follows.
              </p>
              <p>
                The themes presented in §2.4 and §2.6 perform similar analytical work and are labelled
                differently; consolidation would tighten the chapter and remove the appearance of redundancy.
                A{" "}
                <mark className="bg-accent-100 ring-1 ring-accent-300 rounded px-1 py-0.5">
                  citation introduced on page 17
                </mark>{" "}
                appears in the narrative without a corresponding entry in the reference list.
              </p>
            </div>

            <div className="mt-7 rounded-xl ring-1 ring-ink-100 bg-ink-50/50 p-4">
              <div className="flex items-baseline justify-between">
                <div className="eyebrow-soft">Editor's note</div>
                <span className="pill-accent">major · synthesis</span>
              </div>
              <p className="mt-2 text-[14px] leading-[1.65] text-ink-900">
                Add a bridging paragraph between the framework and the literature review that explicitly
                explains how transformational leadership theory organises the themes that follow.
              </p>
            </div>
          </article>

          {/* Right rail — scores */}
          <aside className="col-span-12 lg:col-span-3 p-6">
            <div className="eyebrow-soft">Dissertation readiness</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-semibold tabular text-5xl text-ink-900">84</span>
              <span className="text-ink-400">/100</span>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-500 italic">Committee-ready with minor revisions</p>

            <div className="mt-7 space-y-3">
              {[
                ["Scholarly tone", 86],
                ["APA 7 compliance", 91],
                ["Synthesis depth", 78],
                ["Methodology alignment", 84],
                ["Citation accuracy", 88]
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="text-ink-600">{k}</span>
                    <span className="tabular text-ink-900 font-semibold">{v}</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full bg-ink-900" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-ink-100">
              <div className="eyebrow-soft">Findings</div>
              <p className="mt-1 text-[13px] text-ink-700">7 across 2 agents</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Photographic frontispiece (smaller, side bar feel) */}
      <div className="mt-10 grid grid-cols-12 gap-6 items-center">
        <figure className="col-span-12 lg:col-span-7 relative aspect-[21/9] overflow-hidden ring-1 ring-ink-200 rounded-xl">
          <Image
            src={HERO_FIGURE.src}
            alt={HERO_FIGURE.alt}
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        </figure>
        <p className="col-span-12 lg:col-span-5 font-serif italic text-[18px] leading-[1.5] text-ink-700 balance">
          A precision-driven multi-agent system that validates research workflows and reduces the
          oversight burden on doctoral candidates, committees, and program directors.
        </p>
      </div>
    </motion.div>
  );
}
