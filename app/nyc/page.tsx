import type { Metadata } from "next";
import Script from "next/script";
import { LocationPageBody } from "@/components/sections/location-page";
import { localBusiness } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Dissertation editor in NYC — chapter-grade review for Columbia, NYU, Fordham, CUNY candidates",
  description:
    "Doctoral dissertation editing for New York City candidates. Methodology alignment, APA 7 verification, citation cross-check, and a 0–100 readiness score in 24 hours. From $29 per review, 14-day money-back guarantee.",
  alternates: { canonical: "/nyc" },
  keywords: [
    "dissertation editor NYC",
    "PhD editor New York",
    "EdD editor New York",
    "doctoral dissertation editing NYC",
    "Columbia dissertation editor",
    "NYU dissertation editor",
    "Fordham dissertation editor",
    "CUNY dissertation editor"
  ]
};

export default function NYCPage() {
  const jsonLd = localBusiness({
    region: "New York City",
    city: "New York",
    state: "NY",
    slug: "/nyc"
  });

  return (
    <>
      <Script id="ld-localbusiness-nyc" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LocationPageBody
        region="New York City"
        state="NY"
        shortName="NYC"
        intro="We work with doctoral candidates across the five boroughs and the Hudson and Long Island programs — Columbia, NYU, Fordham, the CUNY Graduate Center, Teachers College, and the regional Ed.D., Ph.D., and DBA programs that pair Manhattan coursework with cohort-based research. Same-week chapter review, methodology alignment, and an exportable audit record your chair can reference."
        institutions={[
          { name: "Columbia University", type: "Ivy · R1", programs: ["Ed.D. (Teachers College)", "Ph.D. (GSAS)", "MPH (Mailman)"] },
          { name: "NYU", type: "R1", programs: ["Ph.D. Steinhardt", "Ph.D. Wagner", "Ph.D. Stern"] },
          { name: "Fordham University", type: "R1", programs: ["Ed.D. Education", "Ph.D. Psychology"] },
          { name: "CUNY Graduate Center", type: "R1", programs: ["Ph.D. Education", "Ph.D. Sociology", "Ph.D. Psychology"] },
          { name: "Teachers College Columbia", type: "R1", programs: ["Ed.D. Educational Leadership"] },
          { name: "The New School", type: "R2", programs: ["Ph.D. Public Engagement"] }
        ]}
        testimonial={{
          quote: "I had three days before my proposal defense and the methodology alignment finding caught a sampling-RQ mismatch my chair had missed. I wouldn't have passed without it.",
          author: "M. Patel, Ed.D. candidate",
          institution: "Teachers College Columbia"
        }}
      />
    </>
  );
}
