import Link from "next/link";
import { UploadZone } from "@/components/upload-zone";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import { clerkEnabled } from "@/lib/clerk-config";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ArrowUpRight, Check, Lock } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload your chapter",
  description:
    "Subscribers upload PDF or DOCX chapters for chapter-grade review — annotated PDF, APA report, methodology alignment, and readiness score returned within 24 hours.",
  alternates: { canonical: "/upload" }
};

async function getActiveSubscription(): Promise<{ signedIn: boolean; hasActive: boolean; plan: string | null }> {
  if (!clerkEnabled) return { signedIn: false, hasActive: false, plan: null };
  let userId: string | null = null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const a = await auth();
    userId = a.userId ?? null;
  } catch {
    return { signedIn: false, hasActive: false, plan: null };
  }
  if (!userId) return { signedIn: false, hasActive: false, plan: null };

  try {
    const { rows } = await db.query(
      `select plan, status
         from subscriptions
        where clerk_user_id = $1
          and status in ('active','trialing')
        order by updated_at desc
        limit 1`,
      [userId]
    );
    if (rows[0]) return { signedIn: true, hasActive: true, plan: rows[0].plan ?? null };
    return { signedIn: true, hasActive: false, plan: null };
  } catch {
    return { signedIn: true, hasActive: false, plan: null };
  }
}

export default async function UploadPage() {
  const { signedIn, hasActive, plan } = await getActiveSubscription();

  // ──────────────────────────────────────────────────────────────────────
  // No active subscription → show the paywall, not the upload form.
  // ──────────────────────────────────────────────────────────────────────
  if (!hasActive) {
    return (
      <>
        <PageMasthead
          number="IV"
          eyebrow="Upload"
          title="An active plan is required to upload."
          dek="Plans start at $49/month. See a real sample annotated review before subscribing — no signup or card required to view the sample."
          photo={PAGE_HEROES.upload}
        />

        <section className="section">
          <div className="container max-w-3xl">
            <div className="card p-8">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white shrink-0">
                  <Lock className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-serif text-[24px] text-ink-900 leading-tight">
                    {signedIn
                      ? "You're signed in, but don't have an active plan yet."
                      : "Subscribe to upload your chapter."}
                  </h2>
                  <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-700">
                    Each plan includes a coordinated multi-agent review of your manuscript:
                    methodology alignment, APA 7 verification, citation cross-check, and a 0–100
                    submission readiness score, delivered by email within 24 hours.
                  </p>
                  <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-700">
                    All plans include a 14-day money-back guarantee — if your first review isn't
                    committee-grade, we refund in full.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid sm:grid-cols-3 gap-3">
                <div className="card-quiet p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">Graduate</div>
                  <div className="mt-1 font-serif text-[24px] text-ink-900 tabular">$49</div>
                  <div className="text-[12px] text-ink-500">per month</div>
                  <p className="mt-2 text-[12.5px] text-ink-600">5 manuscripts/mo · 12,000 words each</p>
                </div>
                <div className="card p-4 ring-2 ring-ink-900 relative">
                  <span className="absolute -top-2.5 left-4 pill-accent text-[10px]">Recommended</span>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">Doctoral</div>
                  <div className="mt-1 font-serif text-[24px] text-ink-900 tabular">$129</div>
                  <div className="text-[12px] text-ink-500">per month</div>
                  <p className="mt-2 text-[12.5px] text-ink-600">12 manuscripts/mo · 25,000 words each</p>
                </div>
                <div className="card-quiet p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">Dissertation</div>
                  <div className="mt-1 font-serif text-[24px] text-ink-900 tabular">$299</div>
                  <div className="text-[12px] text-ink-500">per month</div>
                  <p className="mt-2 text-[12.5px] text-ink-600">Unlimited · 80,000 words each</p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/pricing" className="btn-primary">
                  Compare plans &amp; subscribe
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/sample-review" className="btn-secondary">
                  See a sample review first
                </Link>
                {!signedIn && (
                  <Link href="/signin" className="text-[13.5px] text-ink-700 hover:text-ink-900 underline underline-offset-4 self-center">
                    Already a subscriber? Sign in →
                  </Link>
                )}
              </div>

              <ul className="mt-7 pt-6 border-t border-ink-100 grid sm:grid-cols-3 gap-3 text-[13px] text-ink-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>14-day money-back guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Cancel anytime · no contracts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>FERPA-aware · AES-256 encrypted</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // Signed-in with active subscription → the real upload UI.
  // ──────────────────────────────────────────────────────────────────────
  return (
    <>
      <PageMasthead
        number="IV"
        eyebrow={`Upload · ${plan ? plan + " plan" : "active subscriber"}`}
        title="Upload a chapter — review delivered in 24 hours."
        dek="PDF or DOCX. Methodology alignment, APA 7 verification, citation cross-check, and a 0–100 readiness score — emailed when ready."
        photo={PAGE_HEROES.upload}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <a href="/sample-review" className="rounded-lg bg-paper ring-1 ring-ink-200 px-3 py-2.5 hover:ring-ink-400 transition group">
                <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">See first</div>
                <div className="mt-0.5 text-ink-900 font-medium group-hover:underline underline-offset-4">
                  Sample annotated review →
                </div>
              </a>
              <div className="rounded-lg bg-paper ring-1 ring-ink-200 px-3 py-2.5">
                <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">Security</div>
                <div className="mt-0.5 text-ink-900 font-medium">FERPA-aware · AES-256</div>
              </div>
              <div className="rounded-lg bg-paper ring-1 ring-ink-200 px-3 py-2.5">
                <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">Plan</div>
                <div className="mt-0.5 text-ink-900 font-medium capitalize">{plan ?? "active"}</div>
              </div>
            </div>

            <UploadZone />

            <p className="text-[12px] text-ink-500 text-center">
              Most chapters return within 24 hours · 6–12 hours on Dissertation Intensive
            </p>
          </div>
          <aside className="lg:col-span-5 space-y-6">
            <div>
              <div className="eyebrow">What happens next</div>
              <ol className="mt-4 space-y-3 text-[14px] text-ink-700 list-decimal pl-5 border-l border-ink-200 ml-2 pl-6">
                <li>You'll receive a confirmation email within 60 seconds with your review ID.</li>
                <li>The editor agent runs methodology, tone, and structure passes (~12 minutes).</li>
                <li>The research agent verifies citations and synthesis depth.</li>
                <li>QA validates every finding and scores submission readiness 0–100.</li>
                <li>You receive an email with the annotated PDF, APA report, and prioritised revision plan.</li>
              </ol>
            </div>
            <div className="pt-6 border-t border-ink-200">
              <div className="eyebrow">What we will not do</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-700">
                We validate, edit, and guide scholarly writing. We will not author your
                dissertation, assignment, or capstone on your behalf. Academic integrity is a
                first-class architectural constraint.
              </p>
            </div>
            <div className="pt-6 border-t border-ink-200">
              <div className="eyebrow">Security</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-700">
                Uploads are encrypted in transit and at rest. Files are retained only for the
                period your plan allows. Enterprise customers configure retention at the
                institution level.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
