import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BillingEvent {
  id: number;
  stripe_event_id: string | null;
  kind: string | null;
  status: string | null;
  amount_cents: number | null;
  currency: string | null;
  customer: string | null;
  subscription: string | null;
  payload: any;
  created_at: Date;
}

function fmtMoney(cents: number | null, currency: string | null): string {
  if (cents == null) return "—";
  try {
    return (cents / 100).toLocaleString("en-US", { style: "currency", currency: (currency ?? "USD").toUpperCase() });
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const KIND_PILL: Record<string, string> = {
  succeeded: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  paid: "bg-emerald-100 text-emerald-800",
  refunded: "bg-amber-100 text-amber-800",
  void: "bg-ink-100 text-ink-700"
};

export default async function PaymentsPage() {
  const admin = await requireAdmin();
  if (!admin) return null;

  let events: BillingEvent[] = [];
  let summary = { mrrCents: 0, last30Cents: 0, last30Count: 0, failed: 0, activeSubs: 0 };

  try {
    const r = await db.query(`
      select id, stripe_event_id, kind, status, amount_cents, currency, customer, subscription, payload, created_at
        from billing_events
        order by created_at desc
        limit 100
    `);
    events = r.rows as BillingEvent[];

    const s = await db.query(`
      select
        coalesce(sum(amount_cents) filter (where created_at >= now() - interval '30 days' and status in ('succeeded','paid')), 0)::bigint as last30,
        count(*) filter (where created_at >= now() - interval '30 days' and status in ('succeeded','paid'))::int as last30_count,
        count(*) filter (where status = 'failed')::int as failed
        from billing_events
    `);
    summary.last30Cents = Number(s.rows[0]?.last30 ?? 0);
    summary.last30Count = Number(s.rows[0]?.last30_count ?? 0);
    summary.failed = Number(s.rows[0]?.failed ?? 0);

    const sub = await db.query(`
      select count(*)::int as n,
             coalesce(sum(case
               when plan = 'graduate' then 4900
               when plan = 'doctoral' then 12900
               when plan = 'dissertation' then 29900
               else 0
             end), 0)::int as mrr_cents
        from subscriptions
       where status in ('active','trialing')
    `);
    summary.mrrCents = sub.rows[0]?.mrr_cents ?? 0;
    summary.activeSubs = sub.rows[0]?.n ?? 0;
  } catch (err) {
    console.warn("[admin/payments] load failed:", err);
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px]">
      <div className="eyebrow">Payments</div>
      <h1 className="mt-3 h-display-serif text-[28px] lg:text-[34px] leading-tight">
        {fmtMoney(summary.mrrCents, "USD")} MRR · {summary.activeSubs} active subscribers
      </h1>

      <div className="mt-6 grid grid-cols-4 gap-3">
        <KPI label="MRR (active)" value={fmtMoney(summary.mrrCents, "USD")} />
        <KPI label="Revenue · 30d" value={fmtMoney(summary.last30Cents, "USD")} />
        <KPI label="Payments · 30d" value={String(summary.last30Count)} />
        <KPI label="Failed payments" value={String(summary.failed)} tone={summary.failed > 0 ? "warn" : "ok"} />
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <div className="eyebrow">Recent billing events</div>
          <div className="font-serif text-[18px] text-ink-900 mt-1">Latest 100 Stripe events</div>
        </div>
        {events.length === 0 ? (
          <div className="p-10 text-center text-ink-500">
            <p>No billing events yet.</p>
            <p className="mt-2 text-[12.5px] italic">
              Events land here when Stripe webhooks fire (invoice.paid, customer.subscription.updated, etc.).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead className="bg-paper border-b border-ink-100">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="py-3 pl-5 pr-4 font-medium">When</th>
                  <th className="py-3 pr-4 font-medium">Event</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-5 font-medium">Stripe ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-paper transition">
                    <td className="py-3 pl-5 pr-4 text-ink-600 whitespace-nowrap">{fmtTime(e.created_at)}</td>
                    <td className="py-3 pr-4 font-mono text-[12px] text-ink-900">{e.kind ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${KIND_PILL[e.status ?? ""] ?? "bg-ink-100 text-ink-700"}`}>
                        {e.status ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 tabular text-ink-900">{fmtMoney(e.amount_cents, e.currency)}</td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-ink-500 truncate max-w-[160px]" title={e.customer ?? ""}>
                      {e.customer ?? "—"}
                    </td>
                    <td className="py-3 pr-5 font-mono text-[10.5px] text-ink-400 truncate max-w-[160px]" title={e.stripe_event_id ?? ""}>
                      {e.stripe_event_id ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warn" | "ok" }) {
  const cls =
    tone === "warn"
      ? "bg-amber-50/40 ring-amber-200"
      : tone === "ok" && value === "0"
      ? "bg-emerald-50/30 ring-emerald-100"
      : "ring-ink-100 bg-white";
  return (
    <div className={`rounded-xl ring-1 ${cls} p-4`}>
      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{label}</div>
      <div className="mt-1.5 font-serif text-[24px] text-ink-900 tabular leading-none">{value}</div>
    </div>
  );
}
