import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { CompetitorComparison } from "@/components/sections/competitor-comparison";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Dissertation Editing Center vs Editage / Scribendi",
  description:
    "Traditional human editing services charge per-word and turn around in days. We deliver chapter-grade review in 24 hours at a flat subscription — with an editorial board of doctoral-credentialed advisors setting the standards.",
  alternates: { canonical: "/vs-editage" }
};

export default function VsEditage() {
  return (
    <>
      <PageMasthead
        number="VS"
        eyebrow="Comparison · Editage & Scribendi"
        title="Editage edits in 7–10 days. We deliver in 24 hours."
        dek="Traditional human editing services do excellent work, charge $0.04–$0.12 per word, and turn around in 7–10 days. The speed mismatch with a dissertation timeline is the problem. We deliver equivalent chapter-level review in 24 hours at a flat subscription, with doctoral-credentialed advisors setting the standards."
        photo={PAGE_HEROES.dissertation}
      />
      <CompetitorComparison
        competitorName="Editage / Scribendi"
        competitorPrice="$0.04–$0.12/word (~$300–$900 per chapter)"
        tagline="Speed and price for the dissertation cycle."
        intro="Traditional human editing is a strong product. It's also priced for a single-pass journal-submission workflow, not for the iterative chapter-by-chapter cycle a dissertation actually goes through. A typical Ed.D. or Ph.D. candidate produces 5–8 chapters and rewrites each one 3–5 times. That's 25–40 review passes. At $300–$900 per pass, traditional editing prices itself out of doctoral budgets."
        rows={[
          { capability: "Per-pass cost (typical chapter)", us: "$0 free trial → flat $49–$299/mo", them: "$300–$900" },
          { capability: "Typical turnaround", us: "24 hours (6–12hr on Intensive)", them: "7–10 business days" },
          { capability: "Unlimited revision passes", us: true, them: false },
          { capability: "Methodology alignment review", us: true, them: "partial" },
          { capability: "Citation cross-check vs reference list", us: true, them: "partial" },
          { capability: "Doctoral-credentialed editorial board", us: true, them: true },
          { capability: "Auditable, exportable review record", us: true, them: false },
          { capability: "Submission readiness score (0–100)", us: true, them: false },
          { capability: "Public sample annotated review (no signup)", us: true, them: false },
          { capability: "14-day money-back guarantee", us: true, them: "partial" }
        ]}
        verdict="Use Editage or Scribendi for the single, final pre-submission pass on a journal article or a finished dissertation. Use us across the writing cycle — chapter by chapter, revision by revision. The total cost difference is roughly 10x in our favour across a typical Ed.D. or Ph.D. timeline, and the speed difference is the difference between a sustainable revision cadence and a missed defence window."
      />
    </>
  );
}
