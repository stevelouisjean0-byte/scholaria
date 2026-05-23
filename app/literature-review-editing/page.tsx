import { SeoPage } from "@/components/seo-page";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Literature Review Editing — synthesis, themes, and gap analysis",
  description:
    "Deep evaluation of your literature review's synthesis, thematic coherence, and scholarly depth — with the gaps and weak transitions flagged with verbatim excerpts.",
  alternates: { canonical: "/literature-review-editing" },
  keywords: [
    "literature review editing",
    "literature review review",
    "research synthesis",
    "dissertation literature review",
    "scholarly editing services"
  ]
};

export default function LitReviewPage() {
  return (
    <SeoPage
      number="C"
      eyebrow="Literature review editing"
      photo={PAGE_HEROES.literature}
      heading="A literature review is a conversation. Scholaria reviews the conversation."
      subheading="Synthesis depth, thematic coherence, transitions between theory and evidence, missing voices, and weak claims — surfaced with verbatim excerpts and explicit recommendations."
      intro={[
        "A strong literature review is not a catalogue of sources; it is a synthesised conversation across them. Most weak chapters fail in the same places — summarising studies instead of integrating them, treating themes as headings instead of as arguments, and dropping the theoretical framework once the empirical section starts.",
        "Scholaria's Research Support Agent is built specifically for this work. It evaluates how your sources are actually being used: where the synthesis tightens, where it breaks down, which themes are doing real organising work, and where a citation is propping up a claim that the source does not actually support. The output is a literature-review report you can hand to your chair."
      ]}
      pillars={[
        { title: "Synthesis depth", body: "Evaluates how studies are integrated rather than catalogued. Flags paragraphs that summarise without synthesising." },
        { title: "Thematic coherence", body: "Themes assessed as analytical organisers — not as decorative headings. Misaligned themes are explicitly named." },
        { title: "Framework integration", body: "Surfaces points where the theoretical framework disappears and recommends scholarly bridges." },
        { title: "Gap identification", body: "Names the missing voices, missing sub-questions, and missing analytical moves that committees notice." },
        { title: "Citation alignment", body: "Where a citation is being used to support a claim it does not actually make, the issue is named with the excerpt." },
        { title: "Transitions", body: "Weak transitions between sections, themes, and theory→evidence movement are flagged with rewriting guidance — not replacement prose." }
      ]}
      comparison={[
        { left: "“This chapter feels disorganised.”", right: "Themes presented in §2.4 and §2.6 do similar analytical work but appear under different theme labels. Either consolidate into a single theme or differentiate the analytical purpose explicitly in the opening paragraphs." },
        { left: "Citation supporting a quantitative claim sourced from a qualitative study.", right: "The claim that participation rates increased by 14% (p. 11) is sourced from a qualitative case study that does not report quantitative outcomes. Either substitute a quantitative source or reframe the claim as an interpretive observation." }
      ]}
      faq={[
        { q: "How long a literature review can I upload?", a: "Up to 25,000 words on Doctoral and up to 80,000 words on Dissertation Intensive." },
        { q: "Do you check that my sources are real?", a: "Yes — every cited reference is verified against the reference list, and APA 7 entry structure is checked. Source quality and relevance are scored by the Research Support Agent." },
        { q: "Will you rewrite paragraphs for me?", a: "No. Scholaria recommends changes for you to apply. Authorial voice and intellectual ownership remain with the student." }
      ]}
      testimonialFilter={["synthesis", "support"]}
      ctaTitle="Send your literature review."
      ctaBody="The Research Support Agent activates the moment the file arrives."
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            "@id": "/literature-review-editing#service",
            name: "Scholaria Literature Review Editing",
            serviceType: "Literature review editing — synthesis, themes, gap analysis",
            description:
              "Deep evaluation of how sources speak to each other — synthesis depth, thematic coherence, transitions between theory and evidence, and missing voices flagged with verbatim excerpts.",
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
              { "@type": "ListItem", position: 3, name: "Literature review editing", item: "/literature-review-editing" }
            ]
          }
        ]
      }}
    />
  );
}
