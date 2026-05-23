import { Hero } from "@/components/sections/hero";
import { FeatureVideo } from "@/components/feature-video";
import { TableOfContents } from "@/components/sections/table-of-contents";
import { FEATURE_VIDEO_HERO } from "@/lib/media";

/**
 * Homepage — composed as a magazine cover, not a brochure.
 *
 *   1. Masthead (hero)         — establishes the publication and what it is
 *   2. Feature video           — one engaging moment of motion
 *   3. Table of contents       — the rest of the site, listed and linked
 *
 * Every dense section that used to live here has moved to the page where
 * it belongs:
 *   - The 10-agent ecosystem and 9-step workflow live on /how-it-works
 *   - The eight-pass examination list lives on /services
 *   - The full rate card lives on /pricing
 *   - The editorial principles live on /about
 *   - The correspondence letters live on /about
 *   - The FAQ lives on /faq
 *   - The contact form lives on /contact
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      <FeatureVideo
        eyebrow="The platform, in motion"
        title="See how a manuscript moves through Scholaria."
        caption="A short film about the autonomous review pipeline — intake, scoping, review, QA, delivery."
        slot={FEATURE_VIDEO_HERO}
      />

      <TableOfContents />
    </>
  );
}
