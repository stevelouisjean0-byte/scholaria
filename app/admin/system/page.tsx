import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

async function probeDatabase(): Promise<Check> {
  try {
    const t0 = Date.now();
    const { rows } = await db.query("select count(*)::int as n from jobs");
    const ms = Date.now() - t0;
    return { name: "Database (Supabase Postgres)", ok: true, detail: `Reachable in ${ms}ms · ${rows[0]?.n ?? 0} jobs on file` };
  } catch (err) {
    return { name: "Database (Supabase Postgres)", ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

async function probeEnv(): Promise<Check[]> {
  const required = [
    "DATABASE_URL",
    "RESEND_API_KEY",
    "RESEND_FROM_ADDRESS",
    "OWNER_INBOX_ADDRESS",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "ANTHROPIC_API_KEY",
    "NEXT_PUBLIC_APP_URL",
    "SUPER_ADMIN_EMAILS"
  ];
  return required.map((key) => {
    const present = Boolean(process.env[key]);
    return {
      name: `Env · ${key}`,
      ok: present,
      detail: present
        ? `Set (${process.env[key]!.length} chars${process.env[key]!.startsWith("re_") || process.env[key]!.startsWith("sk_") || process.env[key]!.startsWith("pk_") ? ", prefix: " + process.env[key]!.slice(0, 7) + "…" : ""})`
        : "Missing"
    };
  });
}

async function probeCron(): Promise<Check> {
  try {
    const { rows } = await db.query(`
      select max(updated_at) as last_touch,
             count(*) filter (where event = 'cron.error' and created_at >= now() - interval '24 hours')::int as errors
        from workflow_events
    `);
    const lastTouch = rows[0]?.last_touch as Date | null;
    const errors = rows[0]?.errors ?? 0;
    if (!lastTouch) return { name: "Cron pipeline", ok: false, detail: "No workflow events on record." };
    const ageMin = (Date.now() - new Date(lastTouch).getTime()) / 60000;
    const ok = ageMin < 60 * 24 && errors < 5;
    return {
      name: "Cron pipeline",
      ok,
      detail: `Last event ${Math.round(ageMin)}m ago · ${errors} error${errors === 1 ? "" : "s"} in 24h`
    };
  } catch (err) {
    return { name: "Cron pipeline", ok: false, detail: String(err) };
  }
}

async function probeResend(): Promise<Check> {
  if (!process.env.RESEND_API_KEY) return { name: "Resend", ok: false, detail: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
    });
    if (!res.ok) return { name: "Resend", ok: false, detail: `API responded ${res.status}` };
    const data = await res.json();
    const verified = (data?.data ?? []).filter((d: any) => d.status === "verified").length;
    const total = (data?.data ?? []).length;
    return { name: "Resend", ok: verified > 0, detail: `${verified}/${total} domain${total === 1 ? "" : "s"} verified` };
  } catch (err) {
    return { name: "Resend", ok: false, detail: String(err) };
  }
}

export default async function SystemPage() {
  const ctx = await requireAdmin();
  if (!ctx) return null;

  const [dbCheck, envChecks, cron, resend] = await Promise.all([
    probeDatabase(),
    probeEnv(),
    probeCron(),
    probeResend()
  ]);

  const sections: Array<{ title: string; checks: Check[] }> = [
    { title: "Infrastructure", checks: [dbCheck, cron, resend] },
    { title: "Environment variables", checks: envChecks }
  ];

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1100px]">
      <div className="eyebrow">System health</div>
      <h1 className="mt-3 h-display-serif text-[28px] lg:text-[34px] leading-tight">
        Probe results, generated at request time.
      </h1>
      <p className="mt-2 text-[13.5px] text-ink-600">
        Refresh this page to re-probe. Each check runs server-side and surfaces the actual
        response — not a cached snapshot.
      </p>

      {sections.map((section) => (
        <div key={section.title} className="mt-8">
          <div className="eyebrow mb-3">{section.title}</div>
          <div className="card divide-y divide-ink-100">
            {section.checks.map((c) => (
              <div key={c.name} className="px-5 py-3.5 flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  {c.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-ink-900">{c.name}</div>
                  <div className={`text-[12px] mt-0.5 ${c.ok ? "text-ink-600" : "text-rose-700"}`}>{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-10 card-quiet p-6 text-[12.5px] text-ink-600">
        <div className="eyebrow mb-2">Notes</div>
        <ul className="space-y-2">
          <li>
            <strong className="text-ink-900">Cron pipeline</strong> — “healthy” means workflow_events
            received an entry recently AND fewer than 5 cron.error rows in 24h.
          </li>
          <li>
            <strong className="text-ink-900">Env checks</strong> only verify presence and length —
            not validity. A wrong key will pass this check but fail at runtime.
          </li>
          <li>
            <strong className="text-ink-900">Resend</strong> requires at least 1 verified domain to
            send to arbitrary recipients. <code className="font-mono">onboarding@resend.dev</code> as
            FROM bypasses this restriction for testing.
          </li>
        </ul>
      </div>
    </div>
  );
}
