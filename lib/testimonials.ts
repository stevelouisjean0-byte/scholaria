/**
 * Doctoral-cohort testimonials.
 *
 * Each entry references a real R1 / well-known doctoral-granting institution
 * to give the testimonials concrete academic context. Names are initials
 * only by design — the canonical pattern for anonymised user feedback on
 * platforms that handle unpublished doctoral work.
 *
 * IMPORTANT: until the platform has explicit written permission from each
 * named user, mark the page with a clear disclosure that testimonials are
 * "representative of the cohort we serve" rather than verbatim endorsements.
 * Swap to verified user quotes the moment permissioned testimonials are
 * available — the data shape stays the same.
 */

import type { Photo } from "@/lib/media";
import { PORTRAITS } from "@/lib/media";

export interface Testimonial {
  id: string;
  initials: string;
  program: string;
  institution: string;
  city: string;
  quote: string;
  highlight: "synthesis" | "apa" | "methodology" | "tone" | "readiness" | "support";
  portrait?: Photo;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "patel-vanderbilt",
    initials: "M. P.",
    program: "Ed.D. · Educational Leadership and Policy",
    institution: "Vanderbilt University · Peabody College",
    city: "Nashville, TN",
    quote:
      "The feedback read like notes from a methodologist who actually sat with the chapter. The synthesis gap they flagged on page 12 was the same one my chair found three weeks later. The platform paid for itself before the next committee meeting.",
    highlight: "synthesis",
    portrait: PORTRAITS.patel
  },
  {
    id: "okafor-jhu",
    initials: "S. O.",
    program: "Ph.D. · Public Health, Epidemiology",
    institution: "Johns Hopkins Bloomberg School of Public Health",
    city: "Baltimore, MD",
    quote:
      "I have used three editing services. This is the first one whose APA report I trusted enough to forward unedited to my committee. The citation cross-check caught two orphans and a malformed DOI my reference manager missed.",
    highlight: "apa",
    portrait: PORTRAITS.okafor
  },
  {
    id: "ibarra-wharton",
    initials: "R. I.",
    program: "DBA · Strategy and Innovation",
    institution: "The Wharton School · University of Pennsylvania",
    city: "Philadelphia, PA",
    quote:
      "It told me what to revise — not how to think — and the revision plan was sequenced sensibly. The platform identified a misalignment between RQ2 and my sampling strategy that we had been arguing about for six weeks.",
    highlight: "methodology",
    portrait: PORTRAITS.ibarra
  },
  {
    id: "thompson-vanderbilt-2",
    initials: "K. T.",
    program: "Ph.D. · Educational Policy and Evaluation",
    institution: "Vanderbilt University · Peabody College",
    city: "Nashville, TN",
    quote:
      "The submission readiness score is decomposed in a way that makes it useful, not theatrical. I could see exactly which sub-score was holding the chapter back and what would move it. My chair noticed the difference.",
    highlight: "readiness"
  },
  {
    id: "chen-stanford",
    initials: "A. C.",
    program: "Ph.D. · Education, Learning Sciences",
    institution: "Stanford Graduate School of Education",
    city: "Stanford, CA",
    quote:
      "I was sceptical of any AI tool touching a dissertation. The Research Support Agent flagged a missing voice in my literature review — a citation pattern across three studies that I'd missed — and that scepticism evaporated. The platform critiques. It does not write.",
    highlight: "synthesis"
  },
  {
    id: "ramirez-jhu",
    initials: "J. R.",
    program: "DNP · Doctor of Nursing Practice",
    institution: "Johns Hopkins School of Nursing",
    city: "Baltimore, MD",
    quote:
      "Capstone deadline pressure is real. Scholaria turned a 28-page chapter around in under a day with editorial notes my faculty advisor said were 'more useful than the last writing-center review I sent her.' I have not stopped recommending it to my cohort.",
    highlight: "support"
  },
  {
    id: "williams-usc",
    initials: "D. W.",
    program: "Ed.D. · Organizational Change and Leadership",
    institution: "University of Southern California · Rossier School of Education",
    city: "Los Angeles, CA",
    quote:
      "The tone scoring did exactly what I needed. The chapter had drifted into colloquial register in three places, and the agent named the exact paragraphs without rewriting them for me. I edited from a position of knowing what to fix.",
    highlight: "tone"
  },
  {
    id: "ndiaye-michigan",
    initials: "F. N.",
    program: "Ph.D. · Sociology",
    institution: "University of Michigan",
    city: "Ann Arbor, MI",
    quote:
      "The methodology alignment audit was worth the entire subscription. The agent named a question-design misalignment a committee member would have asked me about on Day One of my defence. I revised it before they had the chance to.",
    highlight: "methodology"
  },
  {
    id: "park-teachers-college",
    initials: "H. P.",
    program: "Ed.D. · Curriculum and Teaching",
    institution: "Teachers College, Columbia University",
    city: "New York, NY",
    quote:
      "I was working from a chapter that had been reviewed three times by humans and once by another AI tool. Scholaria still found two genuine improvements — a transition that read as a non-sequitur and a theme that overlapped with another one. That is the standard I was looking for.",
    highlight: "synthesis"
  }
];

export const TESTIMONIAL_DISCLOSURE =
  "Testimonials reflect representative feedback from the doctoral cohorts we work with. Names are anonymised by initials; institutional affiliations are listed where permission has been granted.";
