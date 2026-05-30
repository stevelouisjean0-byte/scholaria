import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubRow {
  clerk_user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string;
  plan: string | null;
  cadence: string | null;
  status: string | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PLAN_PRICE: Record<string, number> = { graduate: 49, doctoral: 129, dissertation: 299 };

const STATUS_PILL: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  trialing: "bg-blue-100 text-blue-800",
  past_due: "bg-amber-100 text-amber-800",
  unpaid: "bg-amber-100 text-amber-800",
  incomplete: "bg-amber-100 text-amber-800",
  canceled: "bg-rose-100 text-rose-800",
  incomplete_expired: "bg-rose-100 text-rose-800"
};

export default async function UsersPage() {
  const admin = await requireAdmin();
  if (!admin) return null;

  let subs: SubRow[] = [];
  let summary = { active: 0, trialing: 0, past_due: 0, canceled: 0, total: 0 };
  try {
    const r = await db.query(`
      select clerk_user_id, stripe_customer_id, stripe_subscription_id,
             plan, cadence, status, current_period_end, cancel_at_period_end,
             created_at, updated_at
        from subscriptions
        order by updated_at desc
        limit 500
    `);
    subs = r.rows as SubRow[];
    summary.total = subs.length;
    for (const s of subs) {
      if (s.status === "active") summary.active++;
      else if (s.status === "trialing") summary.trialing++;
      else if (s.status === "past_due" || s.status === "unpaid") summary.past_due++;
      else if (s.status === "canceled" || s.status === "incomplete_expired") summary.canceled++;
    }
  } catch (err) {
    console.error("[admin/users] load failed:", err);
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px]">
      <div className="eyebrow">Subscribers</div>
      <h1 className="mt-3 h-display-serif text-[28px] lg:text-[34px] leading-tight">
        {summary.total} subscription{summary.total === 1 ? "" : "s"} on file
      </h1>

      <div className="mt-6 grid grid-cols-4 gap-3">
        <Tile label="Active" value={summary.active} tone="ok" />
        <Tile label="Trialing" value={summary.trialing} tone="info" />
        <Tile label="Past due" value={summary.past_due} tone="warn" />
        <Tile label="Canceled" value={summary.canceled} tone="muted" />
      </div>

      <div className="mt-8 card overflow-hidden">
        {subs.length === 0 ? (
          <div className="p-10 text-center text-ink-500">
            <p>No subscriptions yet.</p>
            <p className="mt-2 text-[12.5px] italic">
              Subscriptions land here once a customer completes Stripe checkout at <code className="font-mono text-[11.5px]">/pricing</code>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead className="bg-paper border-b border-ink-100">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="py-3 pl-5 pr-4 font-medium">Subscriber</th>
                  <th className="py-3 pr-4 font-medium">Plan</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Renews</th>
                  <th className="py-3 pr-4 font-medium">Cadence</th>
                  <th className="py-3 pr-4 font-medium">MRR</th>
                  <th className="py-3 pr-5 font-medium">Stripe IDs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {subs.map((s) => (
                  <tr key={s.stripe_subscription_id} className="hover:bg-paper transition">
                    <td className="py-3.5 pl-5 pr-4 align-top">
                      <div className="font-mono text-[11.5px] text-ink-700 truncate max-w-[180px]" title={s.clerk_user_id}>
                        {s.clerk_user_id}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 align-top capitalize text-ink-900">{s.plan ?? "—"}</td>
                    <td className="py-3.5 pr-4 align-top">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_PILL[s.status ?? ""] ?? "bg-ink-100 text-ink-700"}`}>
                        {s.status ?? "unknown"}
                      </span>
                      {s.cancel_at_period_end && (
                        <div className="text-[10.5px] text-rose-700 mt-1">cancels at period end</div>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 align-top text-ink-700 whitespace-nowrap">{fmtDate(s.current_period_end)}</td>
                    <td className="py-3.5 pr-4 align-top text-ink-700">{s.cadence ?? "—"}</td>
                    <td className="py-3.5 pr-4 align-top tabular text-ink-900">
                      {s.plan && PLAN_PRICE[s.plan] ? `$${PLAN_PRICE[s.plan]}` : "—"}
                    </td>
                    <td className="py-3.5 pr-5 align-top">
                      <div className="font-mono text-[10.5px] text-ink-500 truncate max-w-[160px]" title={s.stripe_subscription_id}>
                        sub: {s.stripe_subscription_id.slice(0, 18)}…
                      </div>
                      {s.stripe_customer_id && (
                        <div className="font-mono text-[10.5px] text-ink-400 mt-0.5 truncate max-w-[160px]" title={s.stripe_customer_id}>
                          cus: {s.stripe_customer_id.slice(0, 18)}…
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11.5px] italic text-ink-500">
        Showing up to 500 most recent subscriptions, ordered by last update.
      </p>
    </div>
  );
}

function Tile({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "ok" | "info" | "warn" | "muted";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50/40 ring-emerald-200"
      : tone === "info"
      ? "bg-blue-50/40 ring-blue-200"
      : tone === "warn"
      ? "bg-amber-50/40 ring-amber-200"
      : "ring-ink-100 bg-white";
  return (
    <div className={`rounded-xl ring-1 ${cls} p-4`}>
      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{label}</div>
      <div className="mt-1.5 font-serif text-[28px] text-ink-900 tabular leading-none">{value}</div>
    </div>
  );
}
