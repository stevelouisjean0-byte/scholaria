import Link from "next/link";
import { UploadZone } from "@/components/upload-zone";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { verifyPurchaseSession } from "@/lib/purchases";
import { enabledProducts, formatPrice } from "@/lib/products";
import { OrderButton } from "@/components/order-button";
import type { Metadata } from "next";
import { ArrowUpRight, CheckCircle2, Lock, AlertTriangle } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload your manuscript",
  description:
    "Order a review at /pricing, then upload your manuscript here. PDF or DOCX, 24-hour turnaround, annotated PDF + APA report + revision plan delivered by email.",
  alternates: { canonical: "/upload" }
};

export default async function UploadPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams?.session_id;

  // ──────────────────────────────────────────────────────────────────────
  // Path A: no session_id → catalog (paywall before form).
  // ──────────────────────────────────────────────────────────────────────
  if (!sessionId) {
    return <CatalogView />;
  }

  // ──────────────────────────────────────────────────────────────────────
  // Path B: session_id present → verify with Stripe, gate accordingly.
  // ──────────────────────────────────────────────────────────────────────
  const result = await verifyPurchaseSession(sessionId);
  if (!result.ok || !result.purchase) {
    return (
      <>
        <PageMasthead
          number="IV"
          eyebrow="Upload"
          title="We couldn't verify that purchase."
          dek="The Stripe session id wasn't recognised, the payment hasn't cleared yet, or the link is malformed. Try refreshing the page in a few seconds, or contact support with your receipt."
          photo={PAGE_HEROES.upload}
        />
        <section className="section">
          <div className="container max-w-2xl">
            <div className="rounded-xl bg-rose-50 ring-1 ring-rose-700/15 p-5 flex gap-3 text-rose-900 text-[14px]">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Verification failed.</p>
                <p className="mt-1 text-[13px]">{result.reason ?? "Unknown error."}</p>
                <p className="mt-3 text-[13px]">
                  Email <a href="mailto:support@doctoralediting.com" className="underline underline-offset-4">support@doctoralediting.com</a>{" "}
                  with this session id: <code className="font-mono text-[12px]">{sessionId}</code> and we'll sort it out within the hour.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-secondary">Back to services</Link>
              <Link href="/contact" className="btn-secondary">Contact support</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Credit already consumed?
  if (result.purchase.consumed_at) {
    return (
      <>
        <PageMasthead
          number="IV"
          eyebrow="Upload"
          title="That review credit has already been used."
          dek="Each order is a single-use credit. The manuscript you submitted with this session is in our pipeline — track it below — or order another review for a new manuscript."
          photo={PAGE_HEROES.upload}
        />
        <section className="section">
          <div className="container max-w-2xl space-y-4">
            <div className="card p-6">
              <div className="eyebrow">Order on file</div>
              <div className="mt-3 text-[14px] text-ink-800">
                <strong className="font-medium text-ink-900">{result.purchase.product_name}</strong>{" "}
                · {formatPrice(result.purchase.amount_cents)} · ordered{" "}
                {new Date(result.purchase.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div className="mt-1 text-[12.5px] text-ink-500">
                Email: {result.purchase.email}
              </div>
              {result.purchase.consumed_job_id && (
                <Link
                  href={`/status/${result.purchase.consumed_job_id}`}
                  className="mt-4 inline-flex items-center gap-1.5 btn-primary"
                >
                  Track your review
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-secondary">Order another review</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ✅ Valid unconsumed purchase — show upload form.
  const product = result.product!;
  return (
    <>
      <PageMasthead
        number="IV"
        eyebrow={`${product.name} · ${formatPrice(product.priceCents)}`}
        title="Upload your manuscript."
        dek={`Your purchase is verified. Drop a PDF or DOCX (up to ${product.wordCap.toLocaleString()} words) and we'll email the annotated review to ${result.purchase.email} within ${product.turnaround}.`}
        photo={PAGE_HEROES.upload}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-700/15 p-4 flex items-start gap-3 text-[13.5px] text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <strong className="font-medium">Purchase verified.</strong>{" "}
                {product.name} · order on file for {result.purchase.email}. One credit available
                — drop your manuscript below to use it.
              </div>
            </div>

            <UploadZone purchaseSessionId={sessionId} prefilledEmail={result.purchase.email} maxWords={product.wordCap} />

            <p className="text-[12px] text-ink-500 text-center">
              Most chapters return within {product.turnaround} · 14-day money-back guarantee
            </p>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div>
              <div className="eyebrow">What happens next</div>
              <ol className="mt-4 space-y-3 text-[14px] text-ink-700 list-decimal pl-5 border-l border-ink-200 ml-2 pl-6">
                <li>Drop your manuscript and submit — confirmation email lands in ~60 seconds.</li>
                <li>The editor agent runs methodology, tone, and structure passes (~12 min).</li>
                <li>The research agent verifies citations and synthesis depth.</li>
                <li>QA validates every finding and scores submission readiness 0–100.</li>
                <li>You receive an email with the annotated PDF, APA report, and revision plan.</li>
              </ol>
            </div>
            <div className="pt-6 border-t border-ink-200">
              <div className="eyebrow">What we will not do</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-700">
                We critique, edit, and guide scholarly writing. We will not author your
                dissertation on your behalf. Academic integrity is a first-class architectural
                constraint.
              </p>
            </div>
            <div className="pt-6 border-t border-ink-200">
              <div className="eyebrow">Security</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-700">
                Uploads are encrypted in transit and at rest. We never train AI models on your
                manuscript. Retention per your plan; delete on demand via{" "}
                <a href="mailto:support@doctoralediting.com" className="underline underline-offset-4">
                  support@doctoralediting.com
                </a>.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function CatalogView() {
  const products = enabledProducts();
  return (
    <>
      <PageMasthead
        number="IV"
        eyebrow="Upload"
        title="Order a review first, then upload your manuscript."
        dek="Each order is a single review — no subscription, no monthly commitment. Pay once, upload once, receive your annotated review by email within 24 hours."
        photo={PAGE_HEROES.upload}
      />

      <section className="section">
        <div className="container max-w-4xl">
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-700/15 p-4 flex items-start gap-3 text-[13.5px] text-amber-900 mb-8">
            <Lock className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <strong className="font-medium">A purchase is required to upload.</strong>{" "}
              Choose the service that matches what you need. After checkout you'll be returned
              here automatically with the upload form unlocked.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.slug}
                className={p.recommended ? "card p-6 ring-2 ring-ink-900 relative" : "card-quiet p-6"}
              >
                {p.recommended && <span className="absolute -top-3 left-6 pill-accent">Most chosen</span>}
                <h3 className="font-serif text-[20px] text-ink-900">{p.name}</h3>
                <p className="text-[12px] text-ink-500 mt-0.5">{p.audience}</p>
                <div className="mt-4 font-serif text-[32px] text-ink-900 tabular leading-none">
                  {formatPrice(p.priceCents)}
                </div>
                <p className="text-[12px] text-ink-500 mt-1">one-time · {p.turnaround}</p>
                <p className="mt-4 text-[12.5px] leading-[1.6] text-ink-600">{p.positioning}</p>
                <div className="mt-5 text-[11.5px] text-ink-500">Up to {p.wordCap.toLocaleString()} words</div>
                <div className="mt-5">
                  <OrderButton
                    product={p.slug}
                    label={`Order — ${formatPrice(p.priceCents)}`}
                    className={p.recommended ? "btn-primary w-full" : "btn-secondary w-full"}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/sample-review" className="text-[14px] text-ink-700 hover:text-ink-900 underline underline-offset-4">
              See a sample annotated review first →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
