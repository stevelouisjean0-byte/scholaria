import Link from "next/link";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { enabledProducts, formatPrice } from "@/lib/products";
import { OrderButton } from "@/components/order-button";
import { Check, CheckCircle2, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Services & pricing — pay per review, no subscription",
  description:
    "Per-service pricing for AI-powered academic review. Research paper $39, APA 7 $29, dissertation chapter $99. One-time payment, 24-hour delivery, 14-day money-back guarantee.",
  alternates: { canonical: "/pricing" }
};

export default function PricingPage() {
  const products = enabledProducts();
  return (
    <>
      <PageMasthead
        number="V"
        eyebrow="Services & pricing"
        title="Pay per review. No subscription. No monthly commitment."
        dek="Most candidates need help with one specific milestone — a chapter, a paper, an APA pass. Buy that, get it back in 24 hours, done. Upgrade to a fuller package only if you need it."
        photo={PAGE_HEROES.pricing}
      />

      {/* Sample-review CTA strip */}
      <section className="border-y border-ink-200 bg-paper">
        <div className="container py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[14px] text-ink-800">
            <strong className="font-medium text-ink-900">See what you'd receive first.</strong>{" "}
            Real annotated review — no signup, no card.
          </div>
          <Link href="/sample-review" className="btn-secondary">
            See a sample review →
          </Link>
        </div>
      </section>

      {/* Product cards */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.slug}
                className={p.recommended ? "card p-6 ring-2 ring-ink-900 relative" : "card-quiet p-6"}
              >
                {p.recommended && (
                  <span className="absolute -top-3 left-6 pill-accent">Most chosen</span>
                )}
                <h2 className="font-serif text-[22px] text-ink-900">{p.name}</h2>
                <p className="text-[12.5px] text-ink-500 mt-0.5">{p.audience}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-serif text-[40px] text-ink-900 tabular leading-none">
                    {formatPrice(p.priceCents)}
                  </span>
                  <span className="text-[12.5px] text-ink-500">one-time</span>
                </div>

                <p className="mt-4 text-[13.5px] leading-[1.6] text-ink-600">{p.positioning}</p>

                <dl className="mt-5 space-y-2 text-[12.5px] border-y border-ink-100 py-4">
                  <Detail k="Word cap" v={`up to ${p.wordCap.toLocaleString()} words`} />
                  <Detail k="Turnaround" v={p.turnaround} />
                </dl>

                <ul className="mt-5 space-y-2 text-[13px]">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-ink-800">{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <OrderButton
                    product={p.slug}
                    label={`Order — ${formatPrice(p.priceCents)}`}
                    className={p.recommended ? "btn-primary w-full" : "btn-secondary w-full"}
                  />
                  <p className="mt-2 text-[11.5px] text-ink-500 text-center">
                    14-day money-back · no recurring charges
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money-back + reassurance strip */}
      <section className="bg-emerald-50/40 border-y border-emerald-700/15">
        <div className="container py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13.5px] text-ink-800">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <strong className="font-medium">14-day money-back guarantee</strong>
          </span>
          <span className="hidden sm:inline-block w-px h-4 bg-emerald-700/30" />
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            One-time payment — no subscriptions
          </span>
          <span className="hidden sm:inline-block w-px h-4 bg-emerald-700/30" />
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <Link href="/sample-review" className="underline underline-offset-4">
              View a sample review first
            </Link>
          </span>
        </div>
      </section>

      {/* FAQ-lite */}
      <section className="section">
        <div className="container max-w-3xl">
          <div className="eyebrow">Common questions</div>
          <dl className="mt-6 space-y-6 text-[14px] text-ink-700">
            <FAQ
              q="Why one-time pricing instead of a subscription?"
              a="Doctoral candidates buy by milestone — a chapter review before a chair meeting, an APA pass before submission, a final review before defense. Subscriptions force you to predict usage and pay for unused months. Per-service pricing lets you spend only when you need a review."
            />
            <FAQ
              q="What if I need multiple reviews?"
              a="Buy multiple. Each purchase is one credit good for one upload. Most candidates buy a chapter review now, then come back a few weeks later when the next chapter is ready."
            />
            <FAQ
              q="Is there a discount for buying several at once?"
              a="Not yet — but volume packages will be announced as more candidates use the platform. For now, each order is independent."
            />
            <FAQ
              q="What's the difference between a chapter review and an APA review?"
              a={
                <>
                  The <strong className="font-medium text-ink-900">Dissertation Chapter Review</strong>{" "}
                  is the full multi-agent pass: methodology alignment, framework continuity, synthesis depth,
                  citation cross-check, annotated PDF, revision plan. The{" "}
                  <strong className="font-medium text-ink-900">APA 7 Review</strong> is focused only
                  on APA 7 formatting compliance — headings, in-text patterns, reference list
                  verification, DOI formatting. Pick chapter review if you want substantive
                  feedback; APA review if you only need formatting cleanup.
                </>
              }
            />
            <FAQ
              q="Can I get a refund if the review isn't useful?"
              a="Yes. 14-day money-back guarantee on every order. Email support@doctoralediting.com with your submission ID and we refund in full, no questions asked."
            />
            <FAQ
              q="Do you offer enterprise/institutional pricing?"
              a={
                <>
                  Yes — universities and graduate programs can deploy this for cohorts.{" "}
                  <Link href="/enterprise" className="underline underline-offset-4">
                    See enterprise →
                  </Link>
                </>
              }
            />
          </dl>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container max-w-3xl text-center">
          <h2 className="headline">Universities &amp; programs</h2>
          <p className="mt-4 text-[15.5px] leading-7 text-ink-600">
            Deploy across a cohort, program, or entire institution. SSO, SCIM, FERPA-aware controls,
            program-level analytics, and branded deliverables are included on Enterprise.
          </p>
          <Link href="/enterprise" className="btn-primary mt-7">
            Talk to enterprise <ArrowUpRight className="h-4 w-4" />
          </Link>
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

function FAQ({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <div>
      <dt className="text-ink-900 font-medium text-[15px]">{q}</dt>
      <dd className="mt-2 leading-[1.7]">{a}</dd>
    </div>
  );
}
