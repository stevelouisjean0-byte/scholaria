import Link from "next/link";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Services — dissertation, APA 7, literature review, methodology",
  description:
    "Scholarly editing and review services for Ph.D., Ed.D., doctoral, and graduate students — dissertation editing, APA 7 review, literature review analysis, methodology alignment, and citation verification.",
  alternates: { canonical: "/services" }
};

const SERVICES = [
  {
    href: "/dissertation-editing",
    eyebrow: "Dissertation editing",
    title: "Chapter-by-chapter editing for doctoral manuscripts",
    body: "Tone, structure, scholarly register, and submission readiness scored across every chapter. Built for Ph.D., Ed.D., and DBA candidates."
  },
  {
    href: "/apa-7-formatting",
    eyebrow: "APA 7 review",
    title: "Precision APA 7 compliance review",
    body: "Headings, in-text patterns, references, DOIs, hanging indents, title case, and edge cases — checked against the current APA 7 specification."
  },
  {
    href: "/literature-review-editing",
    eyebrow: "Literature review",
    title: "Synthesis, thematic coherence, and gap analysis",
    body: "Deep evaluation of how your sources speak to each other — themes, transitions, scholarly depth, and missing voices flagged with verbatim excerpts."
  },
  {
    href: "/research-methodology-review",
    eyebrow: "Methodology review",
    title: "Alignment across questions, design, and analysis",
    body: "Research questions, framework, sampling, and analytical approach reviewed for internal coherence and methodological defensibility."
  },
  {
    href: "/upload?service=citation-verification",
    eyebrow: "Citation verification",
    title: "Every citation matched to every reference",
    body: "Orphaned citations, missing references, malformed DOIs, and APA 7 entry errors surfaced with page-level precision."
  },
  {
    href: "/upload?service=scholarly-editing",
    eyebrow: "Scholarly editing",
    title: "Human-grade scholarly editing at scale",
    body: "Tone refinement, clarity, sentence rhythm, and AI-pattern reduction — calibrated for committees, chairs, and peer reviewers."
  }
];

export default function ServicesPage() {
  return (
    <>
      <PageMasthead
        number="II"
        eyebrow="Services — the editorial desk"
        title="Six scholarly review services. One coordinated agent ecosystem."
        dek="Each vertical is staffed by the agents best suited to it. The orchestration layer keeps them speaking the same language across your manuscript."
        photo={PAGE_HEROES.services}
        ctas={[
          { label: "Submit a manuscript", href: "/upload", primary: true },
          { label: "Read the editorial process", href: "/how-it-works" }
        ]}
      />

      <section className="section">
        <div className="container">
          <ol className="grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
            {SERVICES.map((s, i) => (
              <li
                key={s.href}
                className={`col-span-12 lg:col-span-6 grid grid-cols-12 gap-4 py-10 border-b border-ink-200 ${
                  i % 2 === 1 ? "lg:border-l lg:border-ink-200 lg:pl-10" : ""
                }`}
              >
                <span className="col-span-2 lg:col-span-1 font-mono tabular text-[12px] text-ink-500 pt-1">
                  §{String(i + 1).padStart(2, "0")}
                </span>
                <div className="col-span-10 lg:col-span-11">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-ink-500">{s.eyebrow}</div>
                  <h2 className="mt-2 font-serif text-[24px] leading-snug text-ink-900">
                    <Link href={s.href} className="hover:underline underline-offset-[6px] decoration-1">
                      {s.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-700 max-w-prose">{s.body}</p>
                  <Link
                    href={s.href}
                    className="mt-4 inline-block text-[13.5px] text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2"
                  >
                    Read the service brief →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
