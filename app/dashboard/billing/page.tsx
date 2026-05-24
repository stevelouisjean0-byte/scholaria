import Link from "next/link";
import { CreditCard, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { clerkEnabled } from "@/lib/clerk-config";
import { db } from "@/lib/db";
import { ManageBillingButton } from "@/components/billing/manage-button";
import { CheckoutButton } from "@/components/checkout-button";

export const dynamic = "force-dynamic";

interface SubRow {
  stripe_subscription_id: string;
  stripe_customer_id: string | null;
  plan: string | null;
  cadence: string | null;
  status: string | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
}

async function getActiveSubscription(): Promise<SubRow | null> {
  if (!clerkEnabled) return null;
  let userId: string | null = null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: id } = await auth();
    userId = id ?? null;
  } catch {
    return null;
  }
  if (!userId) return null;

  try {
    const { rows } = await db.query(
      `select stripe_subscription_id, stripe_customer_id, plan, cadence, status,
              current_period_end, cancel_at_period_end
       from subscriptions
       where clerk_user_id = $1
       order by case when status in ('active','trialing') then 0 else 1 end, updated_at desc
       limit 1`,
      [userId]
    );
    return (rows[0] as SubRow) ?? null;
  } catch {
    return null;
  }
}

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  graduate: { name: "Graduate", price: "$49/mo" },
  doctoral: { name: "Doctoral", price: "$129/mo" },
  dissertation: { name: "Dissertation Intensive", price: "$299/mo" }
};

export default async function BillingPage({ searchParams }: { searchParams: { status?: string } }) {
  const sub = await getActiveSubscription();
  const justCompleted = searchParams?.status === "success";

  return (
    <section className="bg-canvas min-h-screen">
      <div className="container py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Dashboard · billing</span>
            <h1 className="mt-3 h-display text-display-lg">Subscription &amp; billing</h1>
            <p className="mt-2 text-[14.5px] text-ink-600 max-w-2xl">
              Manage your plan, invoices, and payment method. Updates are handled through Stripe's
              Customer Portal so changes apply instantly.
            </p>
          </div>
          <Link href="/dashboard" className="btn-ghost">← Back to dashboard</Link>
        </div>

        {justCompleted && (
          <div className="mt-8 rounded-2xl bg-emerald-50 ring-1 ring-emerald-700/15 p-5 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="text-[14px] text-emerald-900">
              <strong className="font-semibold">Subscription activated.</strong> Stripe is provisioning
              your access now. The plan card below will update within a few seconds.
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-12 gap-6">
          {/* Current plan card */}
          <div className="col-span-12 lg:col-span-7 card p-7">
            <div className="flex items-center gap-3 eyebrow">
              <CreditCard className="h-3.5 w-3.5" />
              Current plan
            </div>
            {sub ? (
              <>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <h2 className="font-serif text-3xl text-ink-900">
                      {PLAN_LABELS[sub.plan ?? ""]?.name ?? "Custom plan"}
                    </h2>
                    <p className="text-[13px] text-ink-500 mt-1">
                      {sub.cadence === "annual" ? "Billed annually" : "Billed monthly"} ·{" "}
                      {PLAN_LABELS[sub.plan ?? ""]?.price ?? ""}
                    </p>
                  </div>
                  <StatusPill status={sub.status} />
                </div>

                <dl className="mt-7 pt-6 border-t border-ink-100 grid grid-cols-2 gap-y-3 text-[13.5px]">
                  <dt className="text-ink-500">Renews</dt>
                  <dd className="text-ink-900 tabular text-right">
                    {sub.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString()
                      : "—"}
                  </dd>
                  <dt className="text-ink-500">Auto-renew</dt>
                  <dd className="text-ink-900 text-right">
                    {sub.cancel_at_period_end ? "Off — cancels at period end" : "On"}
                  </dd>
                  <dt className="text-ink-500">Stripe subscription ID</dt>
                  <dd className="text-ink-700 font-mono text-[11.5px] text-right truncate">
                    {sub.stripe_subscription_id}
                  </dd>
                </dl>

                <div className="mt-7 flex flex-wrap gap-3">
                  <ManageBillingButton className="btn-primary" />
                  <Link href="/pricing" className="btn-secondary">
                    Compare plans
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-4 font-serif text-3xl text-ink-900">No active subscription</h2>
                <p className="mt-2 text-[14px] text-ink-600 max-w-lg">
                  Choose a plan to start uploading manuscripts. Cancel anytime through the Customer
                  Portal — no human required.
                </p>

                <div className="mt-7 grid sm:grid-cols-3 gap-3">
                  <PlanQuickStart plan="graduate" name="Graduate" price="$49/mo" />
                  <PlanQuickStart plan="doctoral" name="Doctoral" price="$129/mo" recommended />
                  <PlanQuickStart plan="dissertation" name="Dissertation Intensive" price="$299/mo" />
                </div>
              </>
            )}
          </div>

          {/* What's included sidecar */}
          <aside className="col-span-12 lg:col-span-5 card-quiet p-7">
            <div className="eyebrow">What you get</div>
            <ul className="mt-4 space-y-3 text-[14px] text-ink-800">
              <li className="flex gap-2"><span className="text-ink-400">·</span><span>Autonomous review by the 11-agent ecosystem</span></li>
              <li className="flex gap-2"><span className="text-ink-400">·</span><span>Annotated manuscript + APA 7 report + revision plan PDF</span></li>
              <li className="flex gap-2"><span className="text-ink-400">·</span><span>Dissertation readiness score with decomposed breakdown</span></li>
              <li className="flex gap-2"><span className="text-ink-400">·</span><span>Concierge support by the Client Support Agent</span></li>
              <li className="flex gap-2"><span className="text-ink-400">·</span><span>Full audit trail of every agent invocation</span></li>
            </ul>
            <div className="mt-6 pt-5 border-t border-ink-100 text-[12.5px] text-ink-500">
              Billing is handled by Stripe. Scholaria never stores your card details.{" "}
              <Link href="/security" className="text-ink-900 hover:underline underline-offset-[6px]">
                Security & privacy →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: string | null }) {
  if (status === "active" || status === "trialing") return <span className="pill-success">{status}</span>;
  if (status === "past_due" || status === "unpaid") return <span className="pill-warn">{status}</span>;
  if (status === "canceled" || status === "incomplete_expired") return <span className="pill-danger">{status}</span>;
  return <span className="pill-neutral">{status ?? "unknown"}</span>;
}

function PlanQuickStart({
  plan,
  name,
  price,
  recommended
}: {
  plan: "graduate" | "doctoral" | "dissertation";
  name: string;
  price: string;
  recommended?: boolean;
}) {
  return (
    <div className={recommended ? "card p-5 ring-2 ring-ink-900 relative" : "card-quiet p-5"}>
      {recommended && <span className="absolute -top-3 left-4 pill-accent">Recommended</span>}
      <div className="font-serif text-[18px] text-ink-900">{name}</div>
      <div className="mt-1 font-semibold tabular text-2xl text-ink-900">{price}</div>
      <div className="mt-4">
        <CheckoutButton
          plan={plan}
          cadence="monthly"
          label="Start →"
          className={recommended ? "btn-primary w-full" : "btn-secondary w-full"}
        />
      </div>
    </div>
  );
}
