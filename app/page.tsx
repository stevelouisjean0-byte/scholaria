import { Hero } from "@/components/sections/hero";
import { StatStrip } from "@/components/sections/stat-strip";
import { TrustStrip } from "@/components/sections/trust-strip";
import { LeadInCards } from "@/components/sections/lead-in-cards";
import { AuditTrail } from "@/components/sections/audit-trail";
import { Testimonials } from "@/components/sections/testimonials";
import { ClosingCTA } from "@/components/sections/closing-cta";

/**
 * Homepage — concise, conversion-forward.
 *
 *   1. Hero — outcome-led headline, free-first-review CTA, price/turnaround/refund strip
 *   2. StatStrip — quotable proof points
 *   3. TrustStrip — security and cohort credibility
 *   4. LeadInCards — three doors into the platform
 *   5. AuditTrail — defensible-to-your-committee moat
 *   6. Testimonials — three voices from R1 institutions
 *   7. ClosingCTA
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <StatStrip />
      <TrustStrip />
      <LeadInCards />
      <AuditTrail />
      <Testimonials limit={3} tone="white" />
      <ClosingCTA />
    </>
  );
}
