import type { Metadata } from "next";
import Script from "next/script";
import { LocationPageBody } from "@/components/sections/location-page";
import { localBusiness } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Dissertation editor in New Jersey — chapter-grade review for Rutgers, Princeton, Seton Hall candidates",
  description:
    "Doctoral dissertation editing for New Jersey candidates. Methodology alignment, APA 7 verification, citation cross-check, and a 0–100 readiness score in 24 hours. Free first review.",
  alternates: { canonical: "/new-jersey" },
  keywords: [
    "dissertation editor New Jersey",
    "PhD editor NJ",
    "EdD editor NJ",
    "Rutgers dissertation editor",
    "Princeton dissertation editor",
    "Seton Hall dissertation editor"
  ]
};

export default function NJPage() {
  const jsonLd = localBusiness({
    region: "New Jersey",
    city: "Newark",
    state: "NJ",
    slug: "/new-jersey"
  });

  return (
    <>
      <Script id="ld-localbusiness-nj" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LocationPageBody
        region="New Jersey"
        state="NJ"
        shortName="NJ"
        intro="We work with doctoral candidates across the Rutgers system, Princeton, Seton Hall, Drew, Rowan, and Stevens — the Ed.D., Ph.D., and DBA programs that anchor New Jersey doctoral research. Same-week chapter review with methodology alignment, APA 7 verification, and an exportable audit record your chair and committee can reference."
        institutions={[
          { name: "Rutgers University–New Brunswick", type: "R1 · AAU", programs: ["Ph.D. GSE", "Ph.D. SCJ", "Ph.D. RBS"] },
          { name: "Rutgers University–Newark", type: "R1", programs: ["Ph.D. SPAA", "Ph.D. Nursing"] },
          { name: "Princeton University", type: "Ivy · R1 · AAU", programs: ["Ph.D. WWS", "Ph.D. Sociology"] },
          { name: "Seton Hall University", type: "R2", programs: ["Ed.D. Educational Leadership"] },
          { name: "Rowan University", type: "R2", programs: ["Ed.D. Educational Leadership", "Ph.D. Education"] },
          { name: "Drew University", type: "Private", programs: ["D.Litt. Letters", "DMA"] }
        ]}
        testimonial={{
          quote: "I'm a working teacher doing my Ed.D. at Rutgers GSE part-time. Same-day turnaround on a Saturday is the only reason I made my chair meeting on Monday.",
          author: "S. Thompson, Ed.D. candidate",
          institution: "Rutgers Graduate School of Education"
        }}
      />
    </>
  );
}
