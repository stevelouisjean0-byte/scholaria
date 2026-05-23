import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { LeadInCards } from "@/components/sections/lead-in-cards";
import { Testimonials } from "@/components/sections/testimonials";
import { ClosingCTA } from "@/components/sections/closing-cta";

/**
 * Homepage — kept deliberately brief. Five sections only.
 *
 *   1. Hero — masthead, headline, three CTAs, live product card
 *   2. Trust strip — security & cohort credibility
 *   3. Lead-in cards — three doors into the platform
 *   4. Testimonials — three voices from R1 institutions
 *   5. Closing CTA
 *
 * The dense sections (workflow, agent ecosystem, scoring, before/after,
 * why-different, security, integrity, full pricing, FAQ) live on the pages
 * where they belong. Open the lead-in cards or the nav to find them.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <LeadInCards />
      <Testimonials limit={3} tone="white" />
      <ClosingCTA />
    </>
  );
}
