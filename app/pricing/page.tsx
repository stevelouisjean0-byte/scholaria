import Link from "next/link";
import Script from "next/script";
import { PLANS } from "@/lib/plans";
import { Check, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { CheckoutButton } from "@/components/checkout-button";
import { pricingOffers, dissertationService } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Pricing — Free, Graduate $49, Doctoral $129, Dissertation Intensive $299",
  description:
    "Transparent monthly pricing for chapter-grade dissertation review. Free first review, no credit card. 14-day money-back guarantee on every paid plan. Cancel anytime.",
  alternates: { canonical: "/pricing" }
};

export default function PricingPage() {
  const pricingJsonLd = pricingOffers(
    PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.positioning,
      priceMonthly: p.priceMonthly,
      audience: p.audience
    }))
  );
  const serviceJsonLd = dissertationService();

  return (
    <>
      <Script id="ld-pricing-offers" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
      <Script id="ld-service" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <PageMasthead
        number="V"
        eyebrow="Rates & access"
        title="Transparent pricing. Cancel anytime. 14-day money-back."
        dek="All plans run on the same coordinated review system. Higher tiers unlock more reviewing agents, faster turnaround, methodology + citation passes, and cross-chapter coherence."
        photo={PAGE_HEROES.pricing}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-5 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={p.recommended ? "card p-6 ring-2 ring-ink-900 relative" : "card-quiet p-6"}
            >
              {p.recommended && <span className="absolute -top-3 left-6 pill-accent">Recommended</span>}
              <h2 className="font-serif text-[20px] text-ink-900">{p.name}</h2>
              <p className="text-[12px] text-ink-500">{p.audience}</p>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-serif text-4xl text-ink-900">
                  {p.priceMonthly === 0 ? "Free" : p.priceMonthly === null ? "Custom" : `$${p.priceMonthly}`}
                </span>
                {p.priceMonthly ? <span className="text-[12px] text-ink-500">/ month</span> : null}
              </div>
              {p.priceAnnual && p.priceMonthly ? (
                <p className="text-[11.5px] text-ink-500">${p.priceAnnual}/mo billed annually</p>
              ) : null}
              <p className="mt-4 text-[13px] leading-6 text-ink-600">{p.positioning}</p>
              <dl className="mt-5 space-y-2 text-[12.5px]">
                <Detail k="Upload limit" v={p.uploadLimit} />
                <Detail k="Storage" v={p.storage} />
                <Detail k="Turnaround" v={p.turnaround} />
              </dl>
              <ul className="mt-5 space-y-1.5 text-[13px]">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <span className="text-ink-800">{h}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <div className="eyebrow">Agent access</div>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {p.agentAccess.map((a) => (
                    <li key={a} className="text-[11.5px] text-ink-700 bg-ink-50 ring-1 ring-ink-200 rounded-full px-2 py-0.5">{a}</li>
                  ))}
                </ul>
              </div>
              {p.id === "graduate" || p.id === "doctoral" || p.id === "dissertation" ? (
                <div className="mt-7">
                  <CheckoutButton
                    plan={p.id}
                    cadence="monthly"
                    label={p.cta.label}
                    className={p.recommended ? "btn-primary w-full" : "btn-secondary w-full"}
                  />
                  <p className="mt-2 text-[11.5px] text-ink-500 text-center">
                    14-day money-back guarantee · Cancel anytime
                  </p>
                </div>
              ) : (
                <>
                  <Link href={p.cta.href} className={p.recommended ? "btn-primary mt-7 w-full" : "btn-secondary mt-7 w-full"}>
                    {p.cta.label}
                  </Link>
                  {p.id === "trial" && (
                    <p className="mt-2 text-[11.5px] text-ink-500 text-center">
                      No credit card required
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Money-back guarantee strip — single line that answers the buyer's risk-reversal question. */}
      <section className="bg-emerald-50/40 border-y border-emerald-700/15">
        <div className="container py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13.5px] text-ink-800">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <strong className="font-medium">14-day money-back guarantee</strong>
          </span>
          <span className="hidden sm:inline-block w-px h-4 bg-emerald-700/30" />
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            Cancel anytime — no contracts
          </span>
          <span className="hidden sm:inline-block w-px h-4 bg-emerald-700/30" />
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            Free first review · no card required
          </span>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container max-w-3xl text-center">
          <h2 className="headline">Universities &amp; programs</h2>
          <p className="mt-4 text-[15.5px] leading-7 text-ink-600">
            Deploy across a cohort, program, or entire institution. SSO, SCIM, FERPA-aware controls,
            program-level analytics, and branded deliverables are included on the Enterprise tier.
          </p>
          <Link href="/enterprise" className="btn-primary mt-7">Talk to enterprise</Link>
        </div>
      </section>
    </>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-500">{k}</dt>
      <dd className="text-ink-900 text-right">{v}</dd>
    </div>
  );
}
