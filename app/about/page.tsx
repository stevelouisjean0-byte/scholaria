import { PageMasthead } from "@/components/page-masthead";
import { QualityFeatures } from "@/components/sections/quality";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Scholaria is an autonomous AI dissertation intelligence ecosystem, engineered to give doctoral and graduate researchers the rigor of a top consultancy at the pace of modern infrastructure.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <>
      <PageMasthead
        number="I"
        eyebrow="About — the editorial desk"
        title="Built for serious scholarship — not the average startup."
        dek="Scholaria is an autonomous AI dissertation intelligence ecosystem, engineered to give doctoral and graduate researchers the rigour of a top consultancy at the pace of modern infrastructure."
        photo={PAGE_HEROES.about}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-12 gap-12 prose-academic">
          <div className="lg:col-span-7">
            <p>
              Scholaria began with a simple observation: doctoral students are asked to produce committee-grade
              scholarship while juggling teaching, fieldwork, family, and full-time work — and they are routinely
              denied the kind of rigorous, on-demand editorial support that early-career academics rely on inside
              prestigious institutions.
            </p>
            <p>
              The platform was engineered to close that gap with an autonomous, multi-agent ecosystem. Each agent
              is a specialist. None of them are interchangeable prompts. They communicate through shared memory,
              hand off through an orchestration layer, and are gated by a quality-assurance agent that refuses to
              ship anything that reads as generic.
            </p>
            <h2>What we are</h2>
            <p>
              A premium academic intelligence platform. An enterprise SaaS product. A scholarly review department
              that runs without a help desk, a queue manager, or a manual QA pass.
            </p>
            <h2>What we are not</h2>
            <p>
              A ghostwriter. A dissertation mill. A tool that completes your work for you. Scholaria critiques,
              edits, improves, guides, explains, and strengthens scholarly writing — without writing it for you.
              That distinction is the platform's first principle.
            </p>
            <h2>How we think about academic integrity</h2>
            <p>
              The product never produces replacement prose for an entire section, never generates references on
              behalf of a student, and never substitutes for the intellectual work of the author. Every output
              reads like a thoughtful committee member's notes — explicit, specific, and actionable.
            </p>
          </div>
          <aside className="lg:col-span-5 space-y-4">
            <div className="card-quiet p-6">
              <div className="eyebrow">By the numbers</div>
              <dl className="mt-3 space-y-3 text-[14px]">
                <Row k="Agents in the ecosystem" v="10" />
                <Row k="Average end-to-end review" v="32 minutes" />
                <Row k="Median submission readiness lift" v="+18 points" />
                <Row k="Manuscripts reviewed since launch" v="40,000+" />
                <Row k="Universities in active pilot" v="12" />
              </dl>
            </div>
            <div className="card-quiet p-6">
              <div className="eyebrow">Operating principles</div>
              <ul className="mt-3 space-y-2 text-[14px] text-ink-700">
                <li>· Zero human intervention in the review pipeline.</li>
                <li>· Every output is explicit, scholarly, and actionable.</li>
                <li>· Academic integrity is a first-class platform value.</li>
                <li>· Findings reference verbatim excerpts from the manuscript.</li>
                <li>· QA rejects anything that reads as AI-generated.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

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
