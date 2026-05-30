import Link from "next/link";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { FileText, CheckCircle2, AlertTriangle, ArrowUpRight, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Sample review — see exactly what you'll receive",
  description:
    "A redacted excerpt from a real Ed.D. Chapter 2 review. Annotated PDF, APA 7 report, methodology alignment findings, and a prioritized revision plan — exactly the deliverables you'll receive.",
  alternates: { canonical: "/sample-review" }
};

interface Finding {
  severity: "minor" | "moderate" | "major";
  type: string;
  page: string;
  excerpt: string;
  issue: string;
  recommendation: string;
}

const FINDINGS: Finding[] = [
  {
    severity: "major",
    type: "synthesis",
    page: "p. 12",
    excerpt:
      "Although the framework introduced in Chapter 1 anchors the inquiry in transformational leadership theory, the present chapter shifts to a thematic treatment of empirical studies without re-stating how the framework should organise the synthesis that follows.",
    issue:
      "The transition between the theoretical framework and the literature review lacks sufficient scholarly connection. The chapter pivots to themes without explicit reference back to the framework's organising claim.",
    recommendation:
      "Add a bridging paragraph at the opening of §2.2 that explicitly explains how transformational leadership theory should organise the four themes presented. Cite the framework verbatim from Ch. 1 §1.4.2."
  },
  {
    severity: "moderate",
    type: "structure",
    page: "p. 18, §2.4 / p. 22, §2.6",
    excerpt:
      "Theme: Adaptive leadership behaviours in hybrid schools (§2.4) … Theme: Hybrid school leadership and organisational learning (§2.6) …",
    issue:
      "Themes §2.4 and §2.6 perform similar analytical work but are labelled differently, creating the appearance of redundancy across the chapter's organising spine.",
    recommendation:
      "Consolidate §2.4 and §2.6 into a single theme labelled 'Adaptive leadership and organisational learning in hybrid schools'. Move the three distinguishing sub-claims from §2.6 into the consolidated theme as sub-headings."
  },
  {
    severity: "major",
    type: "citation",
    page: "p. 17",
    excerpt:
      "Senge (2018) emphasises that learning organisations adapt through iterative reframing of leadership norms — a claim closely paralleled in subsequent hybrid-school case work.",
    issue:
      "The in-text citation 'Senge (2018)' is present in the narrative but absent from the reference list (verified against §References pp. 41–48).",
    recommendation:
      "Add the full Senge (2018) reference in APA 7 format, or replace with a cited work that matches the claim. If the citation refers to Senge's earlier work, update both the year and the reference list accordingly."
  },
  {
    severity: "moderate",
    type: "methodology",
    page: "p. 25, §3.4",
    excerpt:
      "Research Question 2 asks: 'How do principal-level transformational leadership behaviours compare across hybrid and traditional school sites?' … Sampling: purposive within a single hybrid site (n=4).",
    issue:
      "Research Question 2 is framed comparatively (hybrid vs. traditional sites), but the sampling strategy is purposive within a single hybrid site. The design cannot answer a comparative RQ.",
    recommendation:
      "Either widen sampling to include traditional sites (and update IRB protocols accordingly), or reframe RQ2 as a single-site inquiry into transformational leadership within a hybrid context."
  },
  {
    severity: "minor",
    type: "tone",
    page: "p. 14",
    excerpt: "It is widely believed that adaptive leadership matters greatly in hybrid contexts.",
    issue:
      "The sentence uses unsourced consensus phrasing ('widely believed') and intensifier ('greatly') — both register as undergraduate-tier in a doctoral chapter.",
    recommendation:
      "Replace with a sourced empirical claim or remove. Suggested rewrite: 'Recent empirical work (e.g., Patel, 2024; Okafor & Nwosu, 2023) documents that adaptive leadership behaviours predict hybrid-school adaptive capacity in K-12 settings.'"
  }
];

export default function SampleReviewPage() {
  return (
    <>
      <PageMasthead
        number="II"
        eyebrow="Sample review"
        title="See exactly what you'll receive — page by page."
        dek="A redacted excerpt from a real Ed.D. Chapter 2 review. Identifying details and the manuscript's institution have been changed; every finding is the agents' actual output."
        photo={PAGE_HEROES.dissertation}
      />

      {/* Deliverables strip */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">What's in your package</div>
          <h2 className="mt-3 h-display text-display-md">Four artefacts, delivered by email.</h2>
          <div className="mt-8 grid grid-cols-12 gap-3">
            {[
              { t: "Annotated PDF", b: "Page-anchored margin notes for every finding, with severity colour-coding and verbatim excerpts." },
              { t: "APA 7 report", b: "Headings, levels, in-text patterns, DOI structure, hanging indents, and reference-list cross-check." },
              { t: "Methodology alignment", b: "Research questions, framework, sampling, design, and analysis examined for internal coherence." },
              { t: "Revision plan", b: "Ordered, prioritised checklist a candidate can act on the same evening — major findings first." }
            ].map((d) => (
              <div key={d.t} className="col-span-12 md:col-span-6 lg:col-span-3 card-quiet p-5">
                <FileText className="h-5 w-5 text-ink-700" />
                <h3 className="mt-3 font-semibold text-[15.5px] text-ink-900">{d.t}</h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-ink-600">{d.b}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <a
              href="/samples/dec-sample-review.pdf"
              className="inline-flex items-center gap-2 text-[14px] text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2"
              target="_blank"
              rel="noopener"
            >
              <Download className="h-4 w-4" />
              Open the full sample review PDF
            </a>
            <p className="mt-1 text-[12.5px] text-ink-500 italic">
              No email required. Generated on-demand from the sample fixture so it always reflects
              current output quality.
            </p>
          </div>
        </div>
      </section>

      {/* Findings sample */}
      <section className="section bg-paper">
        <div className="container">
          <header className="chapter">
            <span className="roman">III.</span>
            <span className="label">Sample findings · Ed.D. Chapter 2</span>
          </header>

          <h2 className="font-serif text-[40px] lg:text-[48px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance max-w-3xl">
            Five findings from a single chapter review.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-ink-700 max-w-3xl">
            Every finding references a verbatim excerpt, names the page, classifies the issue,
            and offers an explicit, actionable recommendation. The full review for this chapter
            returned 14 findings; five are shown here.
          </p>

          <div className="mt-12 space-y-6">
            {FINDINGS.map((f, i) => (
              <article key={i} className="card p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <SeverityBadge severity={f.severity} />
                    <span className="text-[11px] uppercase tracking-[0.22em] text-ink-500">
                      {f.type} · {f.page}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-ink-500 font-mono">
                    finding {String(i + 1).padStart(2, "0")} / 14
                  </span>
                </div>

                <blockquote className="mt-5 pl-4 border-l-2 border-ink-200 font-serif italic text-[15px] leading-[1.65] text-ink-800">
                  "{f.excerpt}"
                </blockquote>

                <div className="mt-5 grid lg:grid-cols-2 gap-5">
                  <div>
                    <div className="eyebrow">Issue</div>
                    <p className="mt-2 text-[14px] leading-[1.65] text-ink-800">{f.issue}</p>
                  </div>
                  <div>
                    <div className="eyebrow">Recommendation</div>
                    <p className="mt-2 text-[14px] leading-[1.65] text-ink-800">{f.recommendation}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/pricing" className="btn-primary">
              Order your own review
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-[12.5px] text-ink-500 italic">
              Dissertation Chapter Review: $99 · 24-hour delivery · 14-day money-back
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function SeverityBadge({ severity }: { severity: "minor" | "moderate" | "major" }) {
  if (severity === "major")
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 ring-1 ring-rose-700/15 text-rose-800 text-[11.5px] font-medium">
        <AlertTriangle className="h-3 w-3" />
        Major
      </span>
    );
  if (severity === "moderate")
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 ring-1 ring-amber-700/15 text-amber-800 text-[11.5px] font-medium">
        <AlertTriangle className="h-3 w-3" />
        Moderate
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-700/15 text-emerald-800 text-[11.5px] font-medium">
      <CheckCircle2 className="h-3 w-3" />
      Minor
    </span>
  );
}
