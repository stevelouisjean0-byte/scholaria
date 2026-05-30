import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { CompetitorComparison } from "@/components/sections/competitor-comparison";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Dissertation Editing Center vs ChatGPT / Claude (DIY)",
  description:
    "The honest case for a structured doctoral review platform over DIY prompting in ChatGPT. Defensibility, methodology depth, audit trail, and academic-integrity safeguards.",
  alternates: { canonical: "/vs-chatgpt" }
};

export default function VsChatGPT() {
  return (
    <>
      <PageMasthead
        number="VS"
        eyebrow="Comparison · ChatGPT / Claude DIY"
        title="ChatGPT can't show your chair what it did. We can."
        dek="DIY prompting in ChatGPT or Claude is free, fast, and dangerous in a doctoral context. The model will happily author replacement prose; produce hallucinated citations; and leave no record. The audit trail is the difference between 'I used AI to refine my chapter' and 'I used AI to rewrite it for me'."
        photo={PAGE_HEROES.dissertation}
      />
      <CompetitorComparison
        competitorName="ChatGPT Plus / Claude Pro"
        competitorPrice="$20/mo"
        tagline="DIY prompting. With committee-defensibility on the line."
        intro="The same underlying model can be used safely or recklessly depending on the workflow around it. Our platform supplies the workflow: a coordinated review system with named agent boundaries, a QA gate that rejects generic AI output, citation verification against your reference list, and an exportable audit log you can hand to your chair."
        rows={[
          { capability: "Powered by frontier models (Claude/GPT-class)", us: true, them: true },
          { capability: "Refuses to author replacement prose", us: true, them: false },
          { capability: "Coordinated multi-agent review (editor + methodology + QA)", us: true, them: false },
          { capability: "Citation cross-check against your actual reference list", us: true, them: "partial" },
          { capability: "Refuses to fabricate citations", us: true, them: false },
          { capability: "Submission readiness score (0–100)", us: true, them: false },
          { capability: "Auditable, exportable review record", us: true, them: false },
          { capability: "Doctoral-credentialed editorial board sets the rules", us: true, them: false },
          { capability: "FERPA-aware data handling", us: true, them: false },
          { capability: "Returns nothing if QA rejects the review as generic", us: true, them: false }
        ]}
        verdict="Use ChatGPT or Claude directly for brainstorming, paraphrase suggestions, and outline scaffolding — that's appropriate. For chapter-grade review of unpublished doctoral work, the audit trail is the difference between defensible and indefensible. A free-tier review here costs nothing and produces an artefact you can show your chair; a DIY ChatGPT session costs $0.40 of compute and produces nothing of the kind."
      />
    </>
  );
}
