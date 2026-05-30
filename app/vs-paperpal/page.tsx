import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { CompetitorComparison } from "@/components/sections/competitor-comparison";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Dissertation Editing Center vs Paperpal",
  description:
    "Paperpal is excellent for academic phrasing and journal submission. We add methodology alignment, dissertation-chapter structure, citation cross-check, and a defensible audit trail.",
  alternates: { canonical: "/vs-paperpal" }
};

export default function VsPaperpal() {
  return (
    <>
      <PageMasthead
        number="VS"
        eyebrow="Comparison · Paperpal"
        title="Paperpal prepares papers for journals. We prepare chapters for committees."
        dek="Paperpal is excellent at the journal-submission stage — phrasing, journal-house-style, plagiarism checks. The doctoral chapter problem is different: it lives or dies on chapter-level structure, methodology alignment, and synthesis depth. That's where we focus."
        photo={PAGE_HEROES.dissertation}
      />
      <CompetitorComparison
        competitorName="Paperpal"
        competitorPrice="$12–$20/mo"
        tagline="Two different problems. Two different tools."
        intro="Paperpal is built for the journal-article workflow: phrasing suggestions, journal-style formatting, plagiarism checks. We're built for the doctoral chapter and dissertation workflow: methodology alignment, framework continuity, citation cross-check across a 200-page document, and a readiness score that maps to committee expectations."
        rows={[
          { capability: "Academic phrasing suggestions", us: "partial", them: true },
          { capability: "Plagiarism / originality check", us: "Q4 2026", them: true },
          { capability: "Journal-house-style formatting", us: false, them: true },
          { capability: "Chapter-level structural review (50+ pages)", us: true, them: "partial" },
          { capability: "Methodology alignment scoring", us: true, them: false },
          { capability: "Citation cross-check vs your reference list", us: true, them: "partial" },
          { capability: "Cross-chapter coherence (dissertation-wide)", us: true, them: false },
          { capability: "Submission readiness score", us: true, them: false },
          { capability: "Refuses to author replacement prose", us: true, them: "partial" },
          { capability: "Auditable, exportable review record", us: true, them: false }
        ]}
        verdict="Use Paperpal during journal submission and for phrasing on shorter manuscripts. Use us during dissertation writing — when the unit of work is a 50-page chapter and the audience is your committee. The two complement each other; we'd recommend both for any doctoral candidate planning to publish during the program."
      />
    </>
  );
}
