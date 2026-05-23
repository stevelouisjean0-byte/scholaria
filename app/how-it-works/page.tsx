import { Workflow } from "@/components/sections/workflow";
import { Ecosystem } from "@/components/sections/ecosystem";
import { QualityFeatures } from "@/components/sections/quality";
import { PageMasthead } from "@/components/page-masthead";
import { Interlude } from "@/components/sections/interlude";
import { PAGE_HEROES, INTERLUDE_DESK } from "@/lib/media";
import { howTo } from "@/lib/jsonld";
import Script from "next/script";
import type { Metadata } from "next";

const HOWTO = howTo({
  name: "How a manuscript is reviewed by Scholaria",
  description:
    "The autonomous, multi-agent review pipeline a doctoral or graduate manuscript moves through on the Scholaria platform — from upload to delivery.",
  totalTime: "PT45M",
  steps: [
    { name: "Upload the manuscript", text: "The student uploads a PDF or DOCX of a dissertation, literature review, capstone, or graduate paper. The Lead Intake Agent activates on receipt." },
    { name: "Lead intake", text: "The Lead Intake Agent captures degree level, paper type, deadline, formatting style, professor feedback, and stated concerns." },
    { name: "Project scoping and routing", text: "The Project Scoping & Routing Agent scores academic complexity, classifies the paper, selects the service track, and prioritises the queue." },
    { name: "Orchestration", text: "The Orchestrator Agent assigns reviewing agents, maintains the shared workflow memory, and drives state transitions across the pipeline." },
    { name: "Reviews in parallel", text: "The Professional Editor Agent and Research Support Agent review the manuscript independently and post explicit findings against shared memory." },
    { name: "Shared memory merge", text: "Findings are deduplicated, ranked by severity, and merged into a single canonical revision document." },
    { name: "Quality assurance", text: "The QA & Final Approval Agent validates every output, scores submission readiness, and rejects any review that is not actionable." },
    { name: "Final scholarly package", text: "An executive summary, annotated document, APA report, citation verification, and downloadable revision package are assembled by the Orchestrator." },
    { name: "Automatic delivery", text: "The Client Support Agent notifies the student in a calm, scholarly voice with their report, scores, and recommended next steps." }
  ]
});

export const metadata: Metadata = {
  title: "How it works — the autonomous review pipeline",
  description:
    "From upload to delivery, every step is run by a Claude Managed Agent through shared memory and an orchestration layer. Zero human intervention.",
  alternates: { canonical: "/how-it-works" }
};

export default function HowItWorks() {
  return (
    <>
      <Script
        id="ld-howto"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO) }}
      />
      <PageMasthead
        number="III"
        eyebrow="How it works — the editorial pipeline"
        title="Zero human intervention. Every step run by a coordinated AI agent."
        dek="Intake, scoping, review, quality assurance, and delivery are owned by named agents that share a single canonical memory document for each manuscript."
        photo={PAGE_HEROES.howItWorks}
      />

      <Workflow />
      <Interlude photo={INTERLUDE_DESK} caption="From desk to delivery, kept under one editorial roof." />
      <Ecosystem />
      <QualityFeatures />
    </>
  );
}
