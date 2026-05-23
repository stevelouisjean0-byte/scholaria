import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { WorkflowViz } from "@/components/sections/workflow-viz";
import { AgentEcosystem } from "@/components/sections/agent-ecosystem";
import { ScoringPreview } from "@/components/sections/scoring-preview";
import { BeforeAfter } from "@/components/sections/before-after";
import { WhyDifferent } from "@/components/sections/why-different";
import { SecurityIntegrity } from "@/components/sections/security-integrity";
import { PricingPreview } from "@/components/sections/pricing-preview";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQ } from "@/components/sections/faq";
import { ClosingCTA } from "@/components/sections/closing-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <WorkflowViz />
      <AgentEcosystem />
      <ScoringPreview />
      <BeforeAfter />
      <WhyDifferent />
      <SecurityIntegrity />
      <PricingPreview />
      <Testimonials />
      <FAQ />
      <ClosingCTA />
    </>
  );
}
