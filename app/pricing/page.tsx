import Link from "next/link";
import { PLANS } from "@/lib/plans";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { CheckoutButton } from "@/components/checkout-button";

export const metadata: Metadata = {
  title: "Pricing — Graduate, Doctoral, Dissertation Intensive, Enterprise",
  description:
    "Plans built around real academic timelines — from a free sample review to institution-wide enterprise deployment.",
  alternates: { canonical: "/pricing" }
};

export default function PricingPage() {
  return (
    <>
      <PageMasthead
        number="V"
        eyebrow="Rates & access"
        title="Choose the plan that matches the work in front of you."
        dek="All plans run on the same autonomous agent ecosystem. Higher tiers unlock more reviewing agents, faster turnaround, and cross-chapter coherence."
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
                </div>
              ) : (
                <Link href={p.cta.href} className={p.recommended ? "btn-primary mt-7 w-full" : "btn-secondary mt-7 w-full"}>
                  {p.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container max-w-3xl text-center">
          <h2 className="headline">Universities & programs</h2>
          <p className="mt-4 text-[15.5px] leading-7 text-ink-600">
            Deploy Scholaria across a cohort, program, or entire institution. SSO, SCIM, FERPA-aware controls,
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
