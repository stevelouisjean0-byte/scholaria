import type { Metadata } from "next";
import Script from "next/script";
import { LocationPageBody } from "@/components/sections/location-page";
import { localBusiness } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Dissertation editor in Connecticut — chapter-grade review for Yale, UConn, and CT R1 candidates",
  description:
    "Doctoral dissertation editing for Connecticut candidates. Methodology alignment, APA 7 verification, citation cross-check, and a 0–100 readiness score in 24 hours. From $29 per review, 14-day money-back guarantee.",
  alternates: { canonical: "/connecticut" },
  keywords: [
    "dissertation editor Connecticut",
    "PhD editor CT",
    "EdD editor CT",
    "Yale dissertation editor",
    "UConn dissertation editor"
  ]
};

export default function CTPage() {
  const jsonLd = localBusiness({
    region: "Connecticut",
    city: "New Haven",
    state: "CT",
    slug: "/connecticut"
  });

  return (
    <>
      <Script id="ld-localbusiness-ct" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LocationPageBody
        region="Connecticut"
        state="CT"
        shortName="CT"
        intro="We work with doctoral candidates at Yale, UConn, the Connecticut State University system, Wesleyan, and Fairfield. Same-week chapter review with methodology alignment, APA 7 verification, citation cross-check, and an exportable audit record your chair can reference."
        institutions={[
          { name: "Yale University", type: "Ivy · R1 · AAU", programs: ["Ph.D. GSAS", "Ph.D. Nursing", "Ph.D. Public Health"] },
          { name: "University of Connecticut (UConn)", type: "R1", programs: ["Ph.D. Neag SOE", "Ph.D. Engineering"] },
          { name: "Central Connecticut State University", type: "Public", programs: ["Ed.D. Educational Leadership"] },
          { name: "Wesleyan University", type: "R2 · Liberal Arts", programs: ["Ph.D. Music", "Ph.D. Math"] },
          { name: "Fairfield University", type: "Private", programs: ["Ed.D. Educational Leadership"] }
        ]}
        testimonial={{
          quote: "I'm working through UConn Neag's Ed.D. program. The methodology pass caught a framework drift between Chapters 2 and 3 that would have cost me months. Worth every dollar of the Doctoral plan.",
          author: "C. Chen, Ed.D. candidate",
          institution: "UConn Neag School of Education"
        }}
      />
    </>
  );
}
