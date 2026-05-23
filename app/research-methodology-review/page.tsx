import { SeoPage } from "@/components/seo-page";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research Methodology Review — alignment, design, defensibility",
  description:
    "Methodology review for Ph.D. and Ed.D. candidates — research questions, framework, sampling, design, and analysis examined for internal coherence and defensibility.",
  alternates: { canonical: "/research-methodology-review" },
  keywords: [
    "research methodology review",
    "dissertation methodology",
    "doctoral methodology",
    "methodology alignment",
    "scholarly editing services"
  ]
};

export default function MethodologyPage() {
  return (
    <SeoPage
      number="D"
      eyebrow="Research methodology review"
      photo={PAGE_HEROES.methodology}
      heading="A methodology is defended at proposal and again at defense. Scholaria audits both."
      subheading="Research questions, framework, sampling, design, and analysis examined for alignment, defensibility, and the questions a committee will ask."
      intro={[
        "Methodology chapters fail in patterns. Research questions are framed comparatively but the design is single-site. Sampling is purposive but justified as if it were random. Coding is described as thematic but the protocol reads as content-analytic. Scholaria's methodology review names the misalignment before the committee does.",
        "Each finding is paired with the question a committee is most likely to ask and a recommendation the student can act on — a tightened research question, a refined sampling justification, or a clearer description of analytical procedure. The agent never rewrites the chapter; it shows the student exactly where the chapter needs to do more work."
      ]}
      pillars={[
        { title: "Question–design alignment", body: "Research questions assessed against the chosen design, framework, and sampling. Drift is flagged section by section." },
        { title: "Sampling defensibility", body: "Sampling strategy reviewed for fit with the design and the questions it can credibly support." },
        { title: "Analytical procedure", body: "Coding, modelling, and analytic procedures evaluated for internal consistency and procedural transparency." },
        { title: "Threats to validity", body: "Reliability, validity, trustworthiness, and limitations assessed for adequacy and honesty." },
        { title: "Ethical considerations", body: "IRB framing, consent, and vulnerable-population considerations reviewed for completeness." },
        { title: "Defense questions", body: "Each major finding is accompanied by the question a committee is most likely to ask about it." }
      ]}
      comparison={[
        { left: "“Methods chapter looks fine.”", right: "RQ2 is comparative across two cohorts, but the sampling described in §3.4 is purposive within a single site. The committee will ask whether RQ2 should be reframed or sampling widened." },
        { left: "Coding protocol described in one paragraph.", right: "Coding described as thematic, but the protocol reads as content-analytic. Either clarify the analytic stance or add a code-development paragraph with example codes." }
      ]}
      faq={[
        { q: "Is methodology review available before IRB submission?", a: "Yes — many candidates use the platform to harden the methods chapter before IRB, and again before defense." },
        { q: "Does it work for qualitative, quantitative, and mixed-methods?", a: "Yes — the Research Support Agent adapts review depth to the design described in the chapter." },
        { q: "Will you propose a new research question for me?", a: "No. The agent surfaces alignment issues and recommends scoping moves; the student decides whether to refine the question or the design." }
      ]}
      testimonialFilter={["methodology", "readiness"]}
      ctaTitle="Send your methodology chapter."
      ctaBody="A methods-grade review typically lands within 24 hours on Doctoral."
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            "@id": "/research-methodology-review#service",
            name: "Scholaria Research Methodology Review",
            serviceType: "Methodology review — alignment, design, defensibility",
            description:
              "Research questions, framework, sampling, design, and analysis examined for internal coherence, methodological defensibility, and the questions a committee will ask.",
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
              { "@type": "ListItem", position: 3, name: "Research methodology review", item: "/research-methodology-review" }
            ]
          }
        ]
      }}
    />
  );
}
