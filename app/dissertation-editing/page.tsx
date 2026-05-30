import { SeoPage } from "@/components/seo-page";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dissertation Editing — Ph.D., Ed.D., and DBA candidates",
  description:
    "Chapter-grade dissertation editing for Ph.D., Ed.D., and DBA candidates. Methodology alignment, APA 7 verification, citation cross-check, and submission readiness scoring delivered in 24 hours. Plans from $49/mo · view a public sample review first.",
  alternates: { canonical: "/dissertation-editing" },
  keywords: [
    "agentic AI dissertation editing",
    "dissertation editing",
    "PhD editing",
    "EdD editing",
    "doctoral paper validation",
    "multi-agent dissertation review",
    "research-grade workflow automation"
  ]
};

export default function DissertationEditing() {
  return (
    <SeoPage
      number="A"
      eyebrow="Dissertation editing"
      photo={PAGE_HEROES.dissertation}
      heading="Chapter-grade dissertation editing for Ph.D., Ed.D., and DBA candidates."
      subheading="Tone, structure, scholarly register, methodology alignment, and submission readiness — scored and explained across every chapter."
      intro={[
        "A dissertation does not get rejected because its sentences are bad. It gets sent back because a transition is weak, a synthesis is shallow, a citation is missing, or a methodological choice is not defended. Scholaria validates your manuscript the way a methodologist on your committee would — explicitly, specifically, and with the page numbers attached.",
        "Doctoral and Ed.D. candidates work with Scholaria in two modes. Some upload a single chapter and ask for a fast, targeted validation before a chair meeting. Others run the system across the entire manuscript, with multi-chapter coherence enabled, in the final weeks before defense.",
        "In both cases the architecture is identical underneath. The Lead Intake Agent captures your context. The Project Scoping & Routing Agent picks the precise review path. The reviewing agents post findings against a shared memory document. The QA & Final Approval Agent reviews every output and refuses to release anything that reads as generic or template-driven. You receive an annotated document, an APA report, a citation cross-check, and a prioritised revision plan — emailed when ready."
      ]}
      pillars={[
        { title: "Chapter-by-chapter validation", body: "Tone, structure, and scholarly register scored at the chapter and section level — not as a single number for the whole manuscript." },
        { title: "Methodology alignment", body: "Research questions, framework, sampling, design, and analysis examined for internal coherence and methodological defensibility." },
        { title: "Citation verification", body: "Every in-text citation matched to its reference list entry. Orphans, malformed DOIs, and APA edge cases flagged with page numbers — intelligent multi-step verification, not a spot-check." },
        { title: "Cross-chapter coherence", body: "On Dissertation Intensive, the system reads across chapters to surface drift in voice, framework, and key term definitions — designed to reduce human oversight requirements." },
        { title: "Defense readiness package", body: "Committee-ready exports — annotated PDF, APA report, citation report, revision plan, and the submission readiness score that drove the recommendation." },
        { title: "Concierge channel", body: "Dissertation Intensive includes a dedicated concierge channel for the final weeks before defense." }
      ]}
      comparison={[
        {
          left: "Generalised editing feedback that says the chapter “lacks flow” without naming a passage.",
          right: "The transition between the theoretical framework and literature review lacks sufficient scholarly connection. Consider adding a paragraph that explicitly explains how transformational leadership theory informs the themes discussed throughout the literature synthesis."
        },
        {
          left: "A reference list spot-check that misses the citation introduced on page 17.",
          right: "The citation on page 17 appears within the narrative but is absent from the reference section. Verify APA 7 formatting requirements and include the complete reference entry."
        },
        {
          left: "A vague note that the methodology section is “not aligned” with the research questions.",
          right: "Research Question 2 is framed comparatively, but the sampling strategy described in §3.4 is purposive within a single site. Either widen sampling or reframe RQ2 to a single-site inquiry."
        }
      ]}
      faq={[
        {
          q: "Can I upload just one chapter?",
          a: "Yes. Most doctoral users send individual chapters before chair meetings. Cross-chapter coherence is available on Dissertation Intensive when the full manuscript is uploaded."
        },
        {
          q: "Will the feedback sound AI-generated?",
          a: "No. Every finding references a verbatim excerpt, follows a calm scholarly register, and is filtered by the QA agent before release. Anything that reads as generic is rejected and regenerated."
        },
        {
          q: "Do you write replacement prose for me?",
          a: "No. Scholaria critiques and guides — it does not author your dissertation. That distinction is the platform's first principle."
        }
      ]}
      testimonialFilter={["synthesis", "tone", "readiness"]}
      ctaTitle="Upload your chapter or full manuscript."
      ctaBody="The reviewing agents engage the moment your file is received — no routing overhead, no waiting for a human assignment."
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            "@id": "/dissertation-editing#service",
            name: "Scholaria Dissertation Editing",
            serviceType: "Dissertation editing for Ph.D., Ed.D., and DBA candidates",
            description:
              "Chapter-by-chapter editing for doctoral manuscripts — tone, structure, scholarly register, methodology alignment, citation verification, and submission readiness.",
            provider: { "@type": "Organization", name: "Scholaria" },
            areaServed: "Worldwide",
            audience: {
              "@type": "EducationalAudience",
              educationalRole: "Doctoral, Ph.D., Ed.D., and DBA candidate"
            }
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Services", item: "/services" },
              { "@type": "ListItem", position: 3, name: "Dissertation editing", item: "/dissertation-editing" }
            ]
          }
        ]
      }}
    />
  );
}
