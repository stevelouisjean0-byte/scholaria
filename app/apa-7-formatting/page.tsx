import { SeoPage } from "@/components/seo-page";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APA 7 Review & Formatting — precision compliance review",
  description:
    "An APA 7 formatting engine that checks heading levels, in-text patterns, references, DOI formatting, hanging indents, title case, and edge cases against the current APA 7 specification.",
  alternates: { canonical: "/apa-7-formatting" },
  keywords: [
    "APA 7 formatting",
    "APA 7 review",
    "APA editing",
    "citation verification",
    "scholarly editing services"
  ]
};

export default function APA7Page() {
  return (
    <SeoPage
      number="B"
      eyebrow="APA 7 review"
      photo={PAGE_HEROES.apa}
      heading="Precision APA 7 review — by an engine that has actually read the manual."
      subheading="Headings, in-text patterns, references, DOIs, hanging indents, title case, and the edge cases your last reviewer missed."
      intro={[
        "APA 7 is unforgiving in the details that committees and journals actually check. A heading level that drifts from Level 3 to Level 4 mid-chapter. A DOI written as a URL instead of the resolver format. A citation introduced on a single page that never makes the reference list. Scholaria's APA 7 review is run by a dedicated checker that reads against the current APA 7 specification rather than a generalised model of what APA usually looks like.",
        "The output is an APA report you can forward to your chair without editing. Each issue is referenced by page, section, and severity. Each fix is described in plain scholarly language — not by quoting style-guide line numbers at the student."
      ]}
      pillars={[
        { title: "Heading levels", body: "Level 1–5 headings verified for hierarchy, capitalisation, and consistency across chapters." },
        { title: "In-text citations", body: "Narrative vs. parenthetical use, multi-author rules, et al. thresholds, secondary citations, and direct-quote page numbers." },
        { title: "Reference list", body: "Hanging indents, italicisation, DOI resolver format, journal abbreviations, edition markers, and edge cases for grey literature." },
        { title: "Tables & figures", body: "Title, note structure, source attribution, and APA 7 table formatting verified per artefact." },
        { title: "Quotations", body: "Block-quote thresholds, ellipsis handling, brackets, and direct-quote page references." },
        { title: "Bias-free language", body: "APA 7 guidance on inclusive, person-first, and identity-conscious language applied without overreach." }
      ]}
      comparison={[
        { left: "Reference list entries inconsistently italicised. DOIs in URL form. Two orphaned citations.", right: "Italicisation normalised, DOI resolver format applied per APA 7 §9.36, orphans flagged with page numbers and a one-line scholarly recommendation per issue." },
        { left: "Headings drift between Level 3 and Level 4 across Chapters 2 and 3.", right: "Heading hierarchy normalised. Each demotion or promotion explained with the section's purpose so the student keeps editorial control." },
        { left: "Direct quote missing a page number on p. 22.", right: "Direct quote on p. 22 missing a page-level citation. APA 7 §8.13 requires the page number in parenthetical or narrative form." }
      ]}
      faq={[
        { q: "Do you only support APA 7?", a: "APA 7 receives full compliance scoring. APA 6, MLA, and Chicago receive scholarly tone and clarity reviews; APA 7-specific scoring is reserved for APA 7 submissions." },
        { q: "Will my chair recognise the report?", a: "Yes — the APA report is structured the way committees read APA feedback: by section, by issue, with verbatim excerpts and severity." },
        { q: "Does this replace a writing center?", a: "It complements one. Many programs route students to Scholaria for the APA pass and to the writing center for substantive thinking work." }
      ]}
      ctaTitle="Send your manuscript for an APA 7 pass."
      ctaBody="The APA report typically lands within 24 hours on Doctoral, and within 12 hours on Dissertation Intensive."
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            "@id": "/apa-7-formatting#service",
            name: "Scholaria APA 7 Review",
            serviceType: "APA 7 formatting review and citation verification",
            description:
              "Precision APA 7 compliance review — headings, in-text patterns, references, DOIs, hanging indents, title case, and edge cases against the current APA 7 specification.",
            provider: { "@type": "Organization", name: "Scholaria" },
            areaServed: "Worldwide",
            audience: {
              "@type": "EducationalAudience",
              educationalRole: "Doctoral, Ph.D., Ed.D., and graduate-level researcher"
            }
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Services", item: "/services" },
              { "@type": "ListItem", position: 3, name: "APA 7 review", item: "/apa-7-formatting" }
            ]
          }
        ]
      }}
    />
  );
}
