import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import {
  FileText,
  Users,
  CreditCard,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Mail
} from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface KPIBlock {
  uploadsToday: number;
  uploadsWeek: number;
  uploadsTotal: number;
  activeReviews: number;
  delivered: number;
  failed: number;
  activeSubscribers: number;
  mrrCents: number;
  failedPayments: number;
  recentErrors: number;
}

async function loadKPIs(): Promise<KPIBlock> {
  const out: KPIBlock = {
    uploadsToday: 0,
    uploadsWeek: 0,
    uploadsTotal: 0,
    activeReviews: 0,
    delivered: 0,
    failed: 0,
    activeSubscribers: 0,
    mrrCents: 0,
    failedPayments: 0,
    recentErrors: 0
  };
  try {
    const { rows: u } = await db.query(`
      select
        count(*)::int as total,
        count(*) filter (where created_at >= now() - interval '24 hours')::int as today,
        count(*) filter (where created_at >= now() - interval '7 days')::int as week,
        count(*) filter (where stage in ('uploaded','intake','scoping','reviewing','qa','delivering'))::int as active,
        count(*) filter (where stage = 'delivered')::int as delivered,
        count(*) filter (where stage = 'failed')::int as failed
      from jobs
    `);
    out.uploadsTotal = u[0]?.total ?? 0;
    out.uploadsToday = u[0]?.today ?? 0;
    out.uploadsWeek = u[0]?.week ?? 0;
    out.activeReviews = u[0]?.active ?? 0;
    out.delivered = u[0]?.delivered ?? 0;
    out.failed = u[0]?.failed ?? 0;
  } catch {}

  try {
    const { rows: subs } = await db.query(`
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
    out.activeSubscribers = subs[0]?.n ?? 0;
    out.mrrCents = subs[0]?.mrr_cents ?? 0;
  } catch {}

  try {
    const { rows: fp } = await db.query(
      `select count(*)::int as n from subscriptions where status in ('past_due','unpaid','incomplete','incomplete_expired')`
    );
    out.failedPayments = fp[0]?.n ?? 0;
  } catch {}

  try {
    const { rows: err } = await db.query(
      `select count(*)::int as n from workflow_events where event = 'cron.error' and created_at >= now() - interval '24 hours'`
    );
    out.recentErrors = err[0]?.n ?? 0;
  } catch {}

  return out;
}

interface RecentSubmission {
  id: string;
  display_id: string | null;
  filename: string;
  stage: string;
  created_at: Date;
  word_count: number | null;
  client_name: string | null;
  client_email: string | null;
}

async function loadRecentSubmissions(): Promise<RecentSubmission[]> {
  try {
    const { rows } = await db.query(`
      select id, display_id, filename, stage, created_at, word_count,
             upload_meta->'intake'->>'firstName' as first_name,
             upload_meta->'intake'->>'lastName' as last_name,
             upload_meta->'intake'->>'email' as email
        from jobs
        order by created_at desc
        limit 8
    `);
    return rows.map((r: any) => ({
      id: r.id,
      display_id: r.display_id,
      filename: r.filename,
      stage: r.stage,
      created_at: r.created_at,
      word_count: r.word_count,
      client_name: [r.first_name, r.last_name].filter(Boolean).join(" ") || null,
      client_email: r.email
    }));
  } catch {
    return [];
  }
}

async function loadRecentActivity(): Promise<Array<{ event: string; created_at: Date; job_id: string | null }>> {
  try {
    const { rows } = await db.query(`
      select event, created_at, job_id
        from workflow_events
        order by created_at desc
        limit 12
    `);
    return rows as any;
  } catch {
    return [];
  }
}

function fmtRelative(d: Date | string): string {
  const ms = Date.now() - new Date(d).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d2 = Math.floor(hr / 24);
  return `${d2}d ago`;
}

function StageIcon({ stage }: { stage: string }) {
  if (stage === "delivered") return <CheckCircle2 className="h-3 w-3 text-emerald-600" />;
  if (stage === "failed") return <AlertTriangle className="h-3 w-3 text-rose-600" />;
  if (stage === "uploaded") return <Clock className="h-3 w-3 text-ink-500" />;
  return <Loader2 className="h-3 w-3 animate-spin text-amber-600" />;
}

export default async function AdminOverview() {
  const admin = await requireAdmin();
  if (!admin) return null; // layout already redirects
  const [kpi, recent, activity] = await Promise.all([loadKPIs(), loadRecentSubmissions(), loadRecentActivity()]);
  const mrrDollars = (kpi.mrrCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px]">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Command center</div>
          <h1 className="mt-3 h-display-serif text-[32px] lg:text-[40px] leading-tight">
            Good {greeting()}, {admin.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[14px] text-ink-600">
            What's happening now across uploads, payments, and the autonomous pipeline.
          </p>
        </div>
      </div>

      {/* Attention strip — only renders things that need attention */}
      {(kpi.failed > 0 || kpi.failedPayments > 0 || kpi.recentErrors > 0) && (
        <div className="mt-8 rounded-xl bg-rose-50 ring-1 ring-rose-700/15 p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] text-rose-900">
          <AlertTriangle className="h-5 w-5 text-rose-700 shrink-0" />
          <span className="font-medium">Needs attention:</span>
          {kpi.failed > 0 && <span>{kpi.failed} failed review{kpi.failed === 1 ? "" : "s"}</span>}
          {kpi.failedPayments > 0 && <span>{kpi.failedPayments} failed payment{kpi.failedPayments === 1 ? "" : "s"}</span>}
          {kpi.recentErrors > 0 && <span>{kpi.recentErrors} cron error{kpi.recentErrors === 1 ? "" : "s"} (24h)</span>}
        </div>
      )}

      {/* KPI grid */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Uploads · today" value={kpi.uploadsToday} sub={`${kpi.uploadsWeek} this week`} />
        <KPI label="Active reviews" value={kpi.activeReviews} sub={`${kpi.delivered} delivered`} />
        <KPI label="Subscribers" value={kpi.activeSubscribers} sub="active + trialing" />
        <KPI label="MRR" value={mrrDollars} sub="from active subs" />
        <KPI label="Failed payments" value={kpi.failedPayments} sub="needs follow-up" tone={kpi.failedPayments > 0 ? "warn" : "ok"} />
        <KPI label="Cron errors (24h)" value={kpi.recentErrors} sub="agent failures" tone={kpi.recentErrors > 0 ? "warn" : "ok"} />
      </div>

      {/* Two-column: recent submissions + live activity */}
      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
            <div>
              <div className="eyebrow">Recent submissions</div>
              <div className="font-serif text-[18px] text-ink-900 mt-1">Latest {recent.length} uploads</div>
            </div>
            <Link href="/admin/submissions" className="text-[13px] text-ink-700 hover:text-ink-900 underline underline-offset-4">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-ink-500 text-[13.5px]">No submissions yet.</div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/status/${r.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-paper transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 text-[13px]">
                        <StageIcon stage={r.stage} />
                        <span className="font-mono text-[12px] text-ink-700">{r.display_id ?? r.id.slice(0, 10)}</span>
                        <span className="text-ink-400">·</span>
                        <span className="text-ink-900 truncate">{r.client_name ?? <span className="italic text-ink-400">anonymous</span>}</span>
                      </div>
                      <div className="text-[12px] text-ink-500 mt-0.5 truncate">
                        {r.filename} · {r.word_count?.toLocaleString() ?? "—"} words
                      </div>
                    </div>
                    <div className="text-[11.5px] text-ink-400 whitespace-nowrap ml-3">{fmtRelative(r.created_at)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b border-ink-100">
            <div className="eyebrow">Live activity</div>
            <div className="font-serif text-[18px] text-ink-900 mt-1">Last 12 events</div>
          </div>
          {activity.length === 0 ? (
            <div className="p-8 text-center text-ink-500 text-[13.5px]">No activity yet.</div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {activity.map((a, i) => (
                <li key={i} className="px-6 py-3 text-[12.5px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-ink-900 truncate">{a.event}</span>
                    <span className="text-[11px] text-ink-400 whitespace-nowrap">{fmtRelative(a.created_at)}</span>
                  </div>
                  {a.job_id && (
                    <Link href={`/status/${a.job_id}`} className="text-[11px] text-ink-500 hover:text-ink-900 underline underline-offset-4 font-mono">
                      {a.job_id.slice(0, 12)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick-jump cards */}
      <div className="mt-10">
        <div className="eyebrow mb-4">Operations</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickCard href="/admin/submissions" icon={FileText} label="All submissions" sub={`${kpi.uploadsTotal} total`} />
          <QuickCard href="/admin/users" icon={Users} label="Subscribers" sub={`${kpi.activeSubscribers} active`} />
          <QuickCard href="/admin/payments" icon={CreditCard} label="Payments" sub={`${mrrDollars} MRR`} />
          <QuickCard href="/admin/activity" icon={Activity} label="Agent activity" sub="full event log" />
          <QuickCard href="/admin/admins" icon={Mail} label="Admin team" sub="manage roles" />
          <QuickCard href="/admin/system" icon={CheckCircle2} label="System health" sub="resend · cron · db" />
        </div>
      </div>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getUTCHours();
  if (h < 11) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function KPI({
  label,
  value,
  sub,
  tone = "default"
}: {
  label: string;
  value: string | number;
  sub: string;
  tone?: "default" | "ok" | "warn";
}) {
  const toneClass =
    tone === "warn"
      ? "ring-amber-200 bg-amber-50/40"
      : tone === "ok" && value === 0
      ? "ring-emerald-100 bg-emerald-50/30"
      : "ring-ink-100 bg-white";
  return (
    <div className={`rounded-xl ring-1 ${toneClass} p-4`}>
      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{label}</div>
      <div className="mt-1.5 font-serif text-[26px] text-ink-900 tabular leading-none">{value}</div>
      <div className="mt-1 text-[11.5px] text-ink-500">{sub}</div>
    </div>
  );
}

function QuickCard({
  href,
  icon: Icon,
  label,
  sub
}: {
  href: string;
  icon: any;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="card-quiet p-4 hover:ring-ink-300 transition flex flex-col gap-2"
    >
      <Icon className="h-5 w-5 text-ink-700" />
      <div>
        <div className="text-[13.5px] text-ink-900 font-medium">{label}</div>
        <div className="text-[11.5px] text-ink-500 mt-0.5">{sub}</div>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-ink-400 ml-auto" />
    </Link>
  );
}
