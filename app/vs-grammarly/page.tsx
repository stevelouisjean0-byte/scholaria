import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { CompetitorComparison } from "@/components/sections/competitor-comparison";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Dissertation Editing Center vs Grammarly Premium",
  description:
    "Honest side-by-side comparison: Grammarly fixes commas. We review methodology, citations, synthesis depth, and submission readiness. See where each tool fits in a doctoral workflow.",
  alternates: { canonical: "/vs-grammarly" }
};

export default function VsGrammarly() {
  return (
    <>
      <PageMasthead
        number="VS"
        eyebrow="Comparison · Grammarly Premium"
        title="Grammarly fixes commas. We review your committee defence."
        dek="Grammarly is excellent at line-edit polish. It does not score methodology alignment, verify citations against your reference list, or refuse to author replacement prose. A side-by-side, written by someone who has used both on the same dissertation chapter."
        photo={PAGE_HEROES.dissertation}
      />
      <CompetitorComparison
        competitorName="Grammarly Premium"
        competitorPrice="$12–$30/mo"
        tagline="Built for sentences. Not for chapters."
        intro="Both tools improve writing quality. Only one of them reads a 50-page chapter as a committee member would — naming the missing transition, the orphaned citation, the framework drift between §2.4 and §2.6, and the methodological misalignment between RQ2 and your sampling strategy."
        rows={[
          { capability: "Real-time grammar & spelling correction", us: "partial", them: true },
          { capability: "Chapter-level structural review", us: true, them: false },
          { capability: "Methodology alignment scoring", us: true, them: false },
          { capability: "Citation cross-check vs reference list", us: true, them: false },
          { capability: "APA 7 verification (headings, DOI, hanging indents)", us: true, them: "partial" },
          { capability: "Submission readiness score (0–100)", us: true, them: false },
          { capability: "Refuses to author replacement prose", us: true, them: false },
          { capability: "Auditable, exportable review record", us: true, them: false },
          { capability: "Microsoft Word / Google Docs add-in", us: "Q4 2026", them: true },
          { capability: "Doctoral-credentialed editorial board sets the rules", us: true, them: false }
        ]}
        verdict="Use Grammarly for line-edit polish on early drafts. Use us when the question is 'will this chapter survive committee'. The two are complementary, not substitutes — Grammarly costs $12/mo, our free tier covers a full chapter review, and the paid tiers ($49–$299/mo) only make sense when committee defensibility is the bar."
      />
    </>
  );
}
