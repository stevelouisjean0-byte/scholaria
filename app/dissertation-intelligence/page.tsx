import Link from "next/link";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { ScoringPreview } from "@/components/sections/scoring-preview";
import { BeforeAfter } from "@/components/sections/before-after";
import { WorkflowViz } from "@/components/sections/workflow-viz";
import { PAGE_HEROES } from "@/lib/media";
import { Brain, BookOpen, FileSearch, ListChecks, Microscope, Quote, Sigma, ShieldCheck, Type, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dissertation Intelligence — the operating system for doctoral writing",
  description:
    "Scholaria's dissertation intelligence engine reviews tone, structure, methodology, synthesis, citations, and submission readiness across every chapter of a doctoral manuscript.",
  alternates: { canonical: "/dissertation-intelligence" }
};

const CAPABILITIES = [
  { icon: Brain,       title: "Dissertation intelligence engine", body: "Cross-chapter coherence, framework drift detection, voice consistency, and committee-style critique." },
  { icon: BookOpen,    title: "Literature review analysis",        body: "Synthesis depth, thematic coherence, gaps, and transitions between theory and evidence." },
  { icon: Quote,       title: "Citation verification",             body: "Every in-text citation matched to its reference entry. Orphans, malformed DOIs, and APA edge cases surfaced." },
  { icon: Type,        title: "APA 7 formatting engine",           body: "Heading hierarchy, in-text patterns, hanging indents, title case, tables, figures, and bias-free language." },
  { icon: Microscope,  title: "Methodology alignment",             body: "Research questions, framework, sampling, design, analysis examined for internal coherence and defensibility." },
  { icon: Sigma,       title: "Scholarly tone scoring",            body: "Tone, register, hedging, and discipline-appropriate voice scored across the manuscript and per section." },
  { icon: ListChecks,  title: "Explicit revision plans",           body: "Findings converted into an ordered, prioritised plan a student can act on the same evening." },
  { icon: FileSearch,  title: "Originality assistance",            body: "Turnitin-style overlap signals and paraphrase guidance — without rewriting the dissertation for the author." },
  { icon: ShieldCheck, title: "Submission readiness score",        body: "A 0–100 number committees and writing centres recognise, decomposed so the underlying components are visible." }
];

export default function Page() {
  return (
    <>
      <PageMasthead
        number="II"
        eyebrow="Dissertation Intelligence"
        title="The operating system for doctoral writing."
        dek="A multi-agent intelligence engine that reads dissertations the way a senior committee member reads them — section by section, with the receipts."
        photo={PAGE_HEROES.howItWorks}
        ctas={[
          { label: "Submit a chapter", href: "/upload", primary: true },
          { label: "View pricing", href: "/pricing" }
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-7">
              <span className="eyebrow">What it examines</span>
              <h2 className="mt-4 h-display text-display-lg">
                Nine examinations on every manuscript.
              </h2>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.7] text-ink-700">
                Each examination is performed by the agent best suited to it. Findings merge into a single
                canonical revision document, with QA gating release. The output reads as if a thoughtful
                committee member had spent an afternoon with your chapter.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:border-l lg:border-ink-200 lg:pl-8">
              <div className="card-dark p-6">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/60">Designed for</div>
                <ul className="mt-3 space-y-2 text-[14px] text-white">
                  <li>· Ph.D. candidates in any discipline</li>
                  <li>· Ed.D. candidates and capstone writers</li>
                  <li>· DBA / DPS / DSW / DNP candidates</li>
                  <li>· Graduate research papers and theses</li>
                  <li>· Writing centres, graduate schools, programmes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-12 gap-3">
            {CAPABILITIES.map((c) => (
              <article key={c.title} className="col-span-12 md:col-span-6 lg:col-span-4 card-quiet p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-[16px] text-ink-900">{c.title}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-ink-600">{c.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ScoringPreview />
      <BeforeAfter />
      <WorkflowViz />

      <section className="section">
        <div className="container max-w-4xl text-center">
          <h2 className="h-display text-display-lg">
            Bring us your chapter. We'll show you what to revise — precisely.
          </h2>
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3">
            <Link href="/upload" className="btn-primary">
              Upload Your Paper
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-secondary">View pricing</Link>
            <Link href="/preview/sample-report" className="btn-ghost">See a sample report →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
