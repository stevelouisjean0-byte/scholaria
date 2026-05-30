import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listPurchases } from "@/lib/purchases";
import { CheckCircle2, Clock, ArrowUpRight } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default async function PurchasesPage() {
  const admin = await requireAdmin();
  if (!admin) return null;

  const purchases = await listPurchases(200);
  const totalGross = purchases.reduce((sum, p) => sum + p.amount_cents, 0);
  const consumed = purchases.filter((p) => p.consumed_at).length;
  const unconsumed = purchases.length - consumed;

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px]">
      <div className="eyebrow">Purchases</div>
      <h1 className="mt-3 h-display-serif text-[28px] lg:text-[34px] leading-tight">
        {purchases.length} one-time order{purchases.length === 1 ? "" : "s"} · {fmtMoney(totalGross)} gross
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Total orders" value={String(purchases.length)} />
        <KPI label="Consumed (review used)" value={String(consumed)} />
        <KPI label="Awaiting upload" value={String(unconsumed)} tone={unconsumed > 0 ? "info" : "default"} />
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <div className="eyebrow">Order ledger</div>
          <div className="font-serif text-[16px] text-ink-900 mt-0.5">200 most recent purchases</div>
        </div>
        {purchases.length === 0 ? (
          <div className="p-10 text-center text-ink-500">No purchases yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[1000px]">
              <thead className="bg-paper border-b border-ink-100">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="py-3 pl-5 pr-4 font-medium">Order</th>
                  <th className="py-3 pr-4 font-medium">Service</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-5 font-medium">Job</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-paper transition">
                    <td className="py-3.5 pl-5 pr-4 align-top text-ink-600 whitespace-nowrap">
                      {fmtTime(p.created_at)}
                      <div className="font-mono text-[10.5px] text-ink-400 mt-0.5 truncate max-w-[160px]" title={p.stripe_session_id}>
                        {p.stripe_session_id.slice(0, 22)}…
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 align-top text-ink-900">{p.product_name ?? p.product_slug}</td>
                    <td className="py-3.5 pr-4 align-top text-ink-700">{p.email}</td>
                    <td className="py-3.5 pr-4 align-top tabular text-ink-900">{fmtMoney(p.amount_cents)}</td>
                    <td className="py-3.5 pr-4 align-top">
                      {p.consumed_at ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          consumed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800">
                          <Clock className="h-3 w-3" />
                          awaiting upload
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-5 align-top">
                      {p.consumed_job_id ? (
                        <Link href={`/status/${p.consumed_job_id}`} className="inline-flex items-center gap-1 text-ink-900 hover:underline underline-offset-4 text-[12px]">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-ink-300 text-[12px]">—</span>
                      )}
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

function KPI({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "info" }) {
  const cls = tone === "info" ? "bg-blue-50/30 ring-blue-200" : "ring-ink-100 bg-white";
  return (
    <div className={`rounded-xl ring-1 ${cls} p-4`}>
      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{label}</div>
      <div className="mt-1.5 font-serif text-[28px] text-ink-900 tabular leading-none">{value}</div>
    </div>
  );
}
