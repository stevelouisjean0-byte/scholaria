import { PageMasthead } from "@/components/page-masthead";
import { QualityFeatures } from "@/components/sections/quality";
import { EditorialBoard } from "@/components/sections/editorial-board";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Scholaria is an Agentic AI operating system for doctoral research — engineered to validate scholarly workflows, reduce human error, and deliver research-grade consistency for doctoral and graduate candidates.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <>
      <PageMasthead
        number="I"
        eyebrow="About — the editorial desk"
        title="Built for serious scholarship — engineered as advanced agentic AI architecture."
        dek="Scholaria is an Agentic AI operating system for doctoral research, engineered to validate scholarly workflows with precision, consistency, and reliability — at the pace of modern infrastructure."
        photo={PAGE_HEROES.about}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-12 gap-12 prose-academic">
          <div className="lg:col-span-7">
            <p>
              Scholaria began with a simple observation: doctoral students are asked to produce committee-grade
              scholarship while juggling teaching, fieldwork, family, and full-time work — and they are routinely
              denied the rigorous, on-demand validation support that early-career academics rely on inside
              prestigious institutions.
            </p>
            <p>
              The platform was engineered to close that gap with an advanced agentic AI architecture. Each
              reviewing agent is a specialist with a defined responsibility — not an interchangeable prompt.
              They communicate through shared memory, hand off through an orchestration layer, and are gated
              by a QA agent built for intelligent multi-step verification. The system is designed to reduce
              human error and improve the accuracy of scholarly workflows end-to-end.
            </p>
            <h2>What we are</h2>
            <p>
              An Agentic AI operating system for doctoral research. An enterprise-grade platform for
              research-grade workflow automation. A scholarly validation department that runs without a
              help desk, a queue manager, or a manual QA pass.
            </p>
            <h2>What we are not</h2>
            <p>
              A ghostwriter. A dissertation mill. A tool that completes your work for you. Scholaria
              validates, critiques, edits, improves, guides, explains, and strengthens scholarly writing
              — without writing it for you. That distinction is the platform's first principle.
            </p>
            <h2>How we think about academic integrity</h2>
            <p>
              The system never produces replacement prose for an entire section, never generates
              references on behalf of a student, and never substitutes for the intellectual work of the
              author. Every output reads like a precise committee member's notes — explicit, specific,
              verifiable, and actionable.
            </p>
          </div>
          <aside className="lg:col-span-5 space-y-4">
            <div className="card-quiet p-6">
              <div className="eyebrow">By the numbers</div>
              <dl className="mt-3 space-y-3 text-[14px]">
                <Row k="Reviewing agents in the ecosystem" v="10" />
                <Row k="Median end-to-end review" v="32 minutes" />
                <Row k="Median submission readiness lift" v="+18 points" />
                <Row k="Universities in active pilot (NYC/NJ/CT)" v="12" />
                <Row k="Founding year" v="2026" />
              </dl>
              <p className="mt-3 text-[11.5px] text-ink-500 italic">
                Metrics refreshed quarterly. Manuscript volume counter is intentionally omitted
                until full transparency methodology is published.
              </p>
            </div>
            <div className="card-quiet p-6">
              <div className="eyebrow">Operating principles</div>
              <ul className="mt-3 space-y-2 text-[14px] text-ink-700">
                <li>· Autonomous execution — minimal human oversight required.</li>
                <li>· Every output is explicit, scholarly, and verifiable.</li>
                <li>· Academic integrity is a first-class architectural constraint.</li>
                <li>· Findings reference verbatim excerpts from the manuscript.</li>
                <li>· QA validates every output and rejects generic AI patterns.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Founder section — named principal, the single highest-impact trust
          fix the audit called for. Placed above the Editorial Board so the
          person who actually answers the phone is the first human a reader
          sees on the page. */}
      <section className="section bg-paper">
        <div className="container max-w-4xl">
          <header className="chapter">
            <span className="roman">I.</span>
            <span className="label">Founder</span>
          </header>

          <div className="grid grid-cols-12 gap-x-10 gap-y-6">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="font-serif text-[32px] lg:text-[40px] leading-tight text-ink-900">
                Steve Louis-Jean — Founder
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-ink-700">
                Steve founded Dissertation Editing Center to close a specific gap: doctoral
                candidates produce 25–40 chapter revision passes during a program, traditional
                editing services price each pass at $300–$900 with 7–10 day turnaround, and the
                math doesn't work for a working teacher or full-time researcher on a five-year
                clock.
              </p>
              <p className="mt-3 text-[15px] leading-[1.7] text-ink-700">
                He builds and runs the underlying review platform, sets the editorial standards
                alongside the board, and is the named human you reach when you have a question
                that's not covered by the FAQ.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <div className="card-quiet p-6">
                <div className="eyebrow">Direct contact</div>
                <ul className="mt-3 space-y-2 text-[14px] text-ink-800">
                  <li>
                    <a
                      href="mailto:founder@dissertationeditingcenter.com"
                      className="underline underline-offset-4"
                    >
                      founder@dissertationeditingcenter.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+14078508823" className="underline underline-offset-4">
                      (407) 850-8823
                    </a>
                  </li>
                  <li className="text-[12.5px] text-ink-500 pt-2 border-t border-ink-100">
                    8315 Northern Blvd, Suite 2 · Jackson Heights, NY 11372
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EditorialBoard />
      <QualityFeatures />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink-100 pb-2 last:border-b-0">
      <dt className="text-ink-500">{k}</dt>
      <dd className="font-serif text-[16px] text-ink-900">{v}</dd>
    </div>
  );
}
