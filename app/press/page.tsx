import type { Metadata } from "next";
import Link from "next/link";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { Download, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Press & media",
  description:
    "Press kit, founding story, and media contact for Dissertation Editing Center. For interview requests and partnership inquiries.",
  alternates: { canonical: "/press" }
};

export default function PressPage() {
  return (
    <>
      <PageMasthead
        number="X"
        eyebrow="Press & media"
        title="For journalists, editors, and program directors."
        dek="Dissertation Editing Center is a New York–based platform that delivers chapter-grade dissertation review through a coordinated multi-agent review system, with standards set by a Ph.D.-credentialed editorial board."
        photo={PAGE_HEROES.about}
      />

      <section className="section">
        <div className="container max-w-3xl prose-academic">
          <h2>About us</h2>
          <p>
            We launched in 2026 to address a specific gap: doctoral candidates produce 25–40
            chapter revision passes during a typical Ed.D. or Ph.D. program, and traditional
            editing services price each pass at $300–$900 with 7–10 day turnaround. The math
            doesn't work for a working teacher or full-time researcher on a five-year clock. We
            built a coordinated review system that delivers equivalent chapter-level critique in
            24 hours at a flat subscription, with the rules audited by a board of Ph.D.-credentialed
            advisors from R1 universities across NYC, NJ, and CT.
          </p>

          <h2>The product, in one sentence</h2>
          <p>
            A coordinated multi-agent review platform that critiques, never authors — purpose-built
            for the doctoral chapter and dissertation workflow.
          </p>

          <h2>Service area</h2>
          <p>
            New York City, New Jersey, and Connecticut directly; doctoral candidates worldwide
            remotely. We work in English with US-based reference standards (APA 7 primary, MLA and
            Chicago supported).
          </p>

          <h2>For journalists</h2>
          <ul>
            <li>Press contact: <a href="mailto:press@dissertationeditingcenter.com">press@dissertationeditingcenter.com</a></li>
            <li>Standard response window: same business day during operating hours</li>
            <li>Founder available for: dissertation-AI ethics, academic integrity policy, agentic AI deployment in education</li>
          </ul>

          <h2>Press kit</h2>
          <p>
            Logo files, founder bio, headshots, and editorial-board credentials are available on
            request. Email press with your outlet and deadline.
          </p>

          <div className="not-prose mt-10 flex flex-wrap gap-4">
            <a
              href="mailto:press@dissertationeditingcenter.com?subject=Press kit request"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Request press kit
            </a>
            <Link href="/about" className="btn-secondary">
              About us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
