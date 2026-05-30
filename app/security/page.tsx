import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { SecurityIntegrity } from "@/components/sections/security-integrity";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Security & Privacy — Your manuscript in 5 sentences",
  description:
    "Plain-language privacy: who sees your manuscript, where it lives, when it's deleted, whether it trains any model, and how to delete it on demand. FERPA-aware, AES-256, audit-trail.",
  alternates: { canonical: "/security" }
};

export default function SecurityPage() {
  return (
    <>
      <PageMasthead
        number="VI"
        eyebrow="Security & privacy"
        title="Your manuscript, in five sentences."
        dek="Before the procurement-grade detail below — here's the part that matters most if you're a candidate about to upload chapter 3 tonight."
        photo={PAGE_HEROES.enterprise}
      />

      {/* Plain-language top section — the audit specifically flagged this as
          the highest-anxiety unanswered question in the funnel. */}
      <section className="section">
        <div className="container max-w-3xl">
          <div className="eyebrow">Plain-language summary</div>
          <ol className="mt-6 space-y-5 text-[15.5px] leading-[1.7] text-ink-800 list-decimal pl-5">
            <li>
              <strong className="text-ink-900 font-medium">Who sees your manuscript:</strong>{" "}
              only the reviewing agents and you. We do not give your manuscript to a human reviewer
              unless you explicitly request concierge review on Dissertation Intensive.
            </li>
            <li>
              <strong className="text-ink-900 font-medium">Where it lives:</strong>{" "}
              encrypted at rest in single-tenant US-region Postgres (AES-256), in transit over TLS
              1.3. The manuscript bytes never leave the platform's database.
            </li>
            <li>
              <strong className="text-ink-900 font-medium">Does it train any model:</strong>{" "}
              no. We never send your manuscript to any third-party AI provider for training.
              We contract with Anthropic under no-train terms; the manuscript appears only in
              one-shot review prompts.
            </li>
            <li>
              <strong className="text-ink-900 font-medium">When it's deleted:</strong>{" "}
              per your plan — 7 days on Free Trial, 12 months on Graduate, retention you control
              on Doctoral and above. You can hard-delete on demand from your dashboard at any
              time; deletion is propagated within 24 hours and confirmed by email.
            </li>
            <li>
              <strong className="text-ink-900 font-medium">How to delete it on demand:</strong>{" "}
              Dashboard → Manuscripts → ⋯ → Delete permanently. Or email{" "}
              <a href="mailto:privacy@dissertationeditingcenter.com" className="underline underline-offset-4">privacy@dissertationeditingcenter.com</a>{" "}
              with your confirmation ID; we respond within 1 business day.
            </li>
          </ol>

          <div className="mt-10 pt-8 border-t border-ink-200">
            <div className="eyebrow">Compliance posture</div>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13.5px] text-ink-700">
              <li className="rounded-lg ring-1 ring-ink-200 bg-paper px-4 py-3">
                <strong className="text-ink-900">FERPA-aware</strong> — student-record-grade controls applied to every job.
              </li>
              <li className="rounded-lg ring-1 ring-ink-200 bg-paper px-4 py-3">
                <strong className="text-ink-900">GDPR posture</strong> — lawful basis: contract performance + consent. EU data subjects: write to <a href="mailto:dpo@dissertationeditingcenter.com" className="underline underline-offset-4">dpo@dissertationeditingcenter.com</a>.
              </li>
              <li className="rounded-lg ring-1 ring-ink-200 bg-paper px-4 py-3">
                <strong className="text-ink-900">SOC 2 Type II</strong> — in progress. Target audit window: Q4 2026. Trust Center launches at start.
              </li>
              <li className="rounded-lg ring-1 ring-ink-200 bg-paper px-4 py-3">
                <strong className="text-ink-900">Sub-processors</strong> — Anthropic (no-train), Supabase (US-region), Upstash Redis, Vercel. List maintained at <a href="/security/subprocessors" className="underline underline-offset-4">/security/subprocessors</a>.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <SecurityIntegrity />
    </>
  );
}
