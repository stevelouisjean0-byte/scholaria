import Link from "next/link";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { BookOpen, BadgeCheck, Scale, ShieldX, FileSearch, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Academic Integrity",
  description:
    "Scholaria critiques, edits, and guides scholarly writing — it does not author dissertations on a student's behalf. The first principle of the platform, explained.",
  alternates: { canonical: "/academic-integrity" }
};

const PRINCIPLES = [
  {
    icon: BookOpen,
    title: "We critique. We do not author.",
    body:
      "Scholaria never produces replacement prose for entire sections, paragraphs, or arguments. Findings reference verbatim excerpts and recommend changes the student decides whether to apply. Authorial voice and intellectual ownership stay with the candidate."
  },
  {
    icon: BadgeCheck,
    title: "Originality assistance, not bypass",
    body:
      "Turnitin-style overlap signals and paraphrase guidance are designed to make student work submission-ready, never to evade detection. The platform refuses to rewrite passages with the explicit purpose of defeating similarity-checking tools."
  },
  {
    icon: Scale,
    title: "The QA agent has veto power",
    body:
      "Any output that reads as AI-generated, generic, template-driven, or as full replacement prose is rejected by the QA agent and regenerated. The student sees only outputs that pass that gate."
  },
  {
    icon: ShieldX,
    title: "No ghostwritten dissertations. Ever.",
    body:
      "Scholaria is not, and will never become, a service that produces dissertations end-to-end on behalf of a student. We refuse uploads framed as requests to author entire chapters, and we name this commitment in our terms of service."
  },
  {
    icon: FileSearch,
    title: "Auditable by design",
    body:
      "Every agent invocation, finding, and revision is durable in the job ledger. If a chair or institutional integrity officer asks how the platform was used in a specific manuscript, the full editorial trail is exportable."
  },
  {
    icon: Quote,
    title: "Citation integrity matters",
    body:
      "The Research Support Agent flags fabricated citations, orphans, and malformed entries explicitly. The platform refuses to recommend sources it cannot verify in scholarly databases."
  }
];

export default function AcademicIntegrityPage() {
  return (
    <>
      <PageMasthead
        number="VII"
        eyebrow="Academic integrity"
        title="The first principle of the platform."
        dek="Scholaria is not a ghostwriter and is not a paraphrase laundry. It is engineered to be defensible if a chair, committee, or institutional integrity officer asks how it was used."
        photo={PAGE_HEROES.faq}
      />

      <section className="section">
        <div className="container">
          <div className="max-w-3xl">
            <span className="eyebrow">Six commitments</span>
            <h2 className="mt-4 h-display text-display-lg">
              What you should be able to tell your committee, in plain language.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-12 gap-3">
            {PRINCIPLES.map((p) => (
              <article key={p.title} className="col-span-12 md:col-span-6 card-quiet p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-[18px] text-ink-900">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-ink-700">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container max-w-4xl">
          <span className="eyebrow">For institutions</span>
          <h2 className="mt-4 h-display text-display-lg">
            A platform you can defend in front of a faculty senate.
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-ink-700 max-w-3xl">
            Scholaria is built to be deployed inside a writing centre, graduate school, or research
            office as durable institutional capacity — not as a workaround. The Enterprise tier
            includes a Data Processing Agreement, audit-log export, programme-level retention controls,
            and a written commitment that institutional use will never include full-manuscript
            ghostwriting capabilities, even on request.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/enterprise" className="btn-primary">Read the enterprise terms</Link>
            <Link href="/security" className="btn-secondary">Security &amp; privacy</Link>
            <Link href="/contact" className="btn-ghost">Speak with the desk →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
