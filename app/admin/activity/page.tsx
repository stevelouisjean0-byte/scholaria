import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EventRow {
  id: number;
  job_id: string | null;
  event: string;
  payload: any;
  created_at: Date;
}

function fmtTime(d: Date): string {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
}

function fmtRelative(d: Date): string {
  const ms = Date.now() - new Date(d).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default async function ActivityPage() {
  const admin = await requireAdmin();
  if (!admin) return null;

  let events: EventRow[] = [];
  let summary = { total: 0, errors24h: 0, completions24h: 0 };
  try {
    const r = await db.query(`
      select id, job_id, event, payload, created_at
        from workflow_events
        order by created_at desc
        limit 300
    `);
    events = r.rows as EventRow[];
    const s = await db.query(`
      select
        count(*)::int as total,
        count(*) filter (where event = 'cron.error' and created_at >= now() - interval '24 hours')::int as errors24h,
        count(*) filter (where event like '%.complete' and created_at >= now() - interval '24 hours')::int as completions24h
        from workflow_events
    `);
    summary.total = s.rows[0]?.total ?? 0;
    summary.errors24h = s.rows[0]?.errors24h ?? 0;
    summary.completions24h = s.rows[0]?.completions24h ?? 0;
  } catch (err) {
    console.error("[admin/activity] load failed:", err);
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px]">
      <div className="eyebrow">Agent activity</div>
      <h1 className="mt-3 h-display-serif text-[28px] lg:text-[34px] leading-tight">
        Live event feed — {summary.total.toLocaleString()} events on file
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Total events" value={summary.total.toLocaleString()} />
        <KPI label="Completions · 24h" value={String(summary.completions24h)} tone="ok" />
        <KPI label="Errors · 24h" value={String(summary.errors24h)} tone={summary.errors24h > 0 ? "warn" : "ok"} />
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 flex items-center gap-3">
          <Activity className="h-4 w-4 text-ink-700" />
          <div>
            <div className="eyebrow">Workflow events</div>
            <div className="font-serif text-[16px] text-ink-900 mt-0.5">Most recent 300, newest first</div>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="p-10 text-center text-ink-500">No events yet.</div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {events.map((e) => {
              const isError = e.event === "cron.error" || e.event.includes("error");
              const isComplete = e.event.endsWith(".complete");
              return (
                <li key={e.id} className="px-6 py-3 flex items-start gap-3 text-[13px]">
                  <span className="mt-1 shrink-0">
                    {isError ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    ) : isComplete ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 text-ink-500" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`font-mono text-[12.5px] ${isError ? "text-rose-700" : "text-ink-900"}`}>
                        {e.event}
                      </span>
                      <span className="text-[11px] text-ink-400 whitespace-nowrap" title={fmtTime(e.created_at)}>
                        {fmtRelative(e.created_at)}
                      </span>
                    </div>
                    {e.job_id && (
                      <Link href={`/status/${e.job_id}`} className="text-[11px] text-ink-500 hover:text-ink-900 underline underline-offset-4 font-mono">
                        {e.job_id}
                      </Link>
                    )}
                    {e.payload && (
                      <pre className="mt-1 text-[10.5px] text-ink-600 font-mono whitespace-pre-wrap break-all bg-paper rounded px-2 py-1 max-h-32 overflow-auto">
                        {typeof e.payload === "string" ? e.payload : JSON.stringify(e.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warn" | "ok" }) {
  const cls =
    tone === "warn"
      ? "bg-amber-50/40 ring-amber-200"
      : tone === "ok"
      ? "bg-emerald-50/30 ring-emerald-100"
      : "ring-ink-100 bg-white";
  return (
    <div className={`rounded-xl ring-1 ${cls} p-4`}>
      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{label}</div>
      <div className="mt-1.5 font-serif text-[24px] text-ink-900 tabular leading-none">{value}</div>
    </div>
  );
}
