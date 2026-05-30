import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  display_id: string | null;
  filename: string;
  stage: string;
  created_at: Date;
  updated_at: Date;
  word_count: number | null;
  reviews_received: number;
  reviews_expected: number;
  memory: any;
  upload_meta: any;
}

interface EventRow {
  event: string;
  created_at: Date;
}

const STAGE_ORDER = ["uploaded", "intake", "scoping", "reviewing", "qa", "delivering", "delivered"] as const;

const STAGE_LABEL: Record<string, string> = {
  uploaded: "File received",
  intake: "Lead Intake — capturing context",
  scoping: "Project Scoping — routing review",
  reviewing: "Editor &amp; methodology review in progress",
  qa: "QA &amp; Final Approval",
  delivering: "Assembling your final package",
  delivered: "Review complete — package ready"
};

const STAGE_HELPER: Record<string, string> = {
  uploaded: "Your manuscript has been received and queued.",
  intake: "Reading your manuscript to understand context.",
  scoping: "Routing to the right reviewing agents.",
  reviewing: "Editor and methodology agents are reviewing in parallel — usually 10–25 minutes.",
  qa: "QA agent is validating every finding before delivery.",
  delivering: "Assembling executive summary and revision plan.",
  delivered: "Your annotated PDF, APA report, and revision plan are ready."
};

const STAGE_EVENT_MAP: Record<string, string> = {
  uploaded: "queued.intake",
  intake: "intake.complete",
  scoping: "scope.complete",
  reviewing: "review.complete",
  qa: "qa.complete",
  delivering: "delivery.complete",
  delivered: "delivery.complete"
};

async function getJob(jobId: string): Promise<JobRow | null> {
  try {
    const { rows } = await db.query(
      `select id, display_id, filename, stage, created_at, updated_at, word_count,
              reviews_received, reviews_expected, memory, upload_meta
         from jobs
        where id = $1
        limit 1`,
      [jobId]
    );
    return (rows[0] as JobRow) ?? null;
  } catch {
    return null;
  }
}

async function getEvents(jobId: string): Promise<EventRow[]> {
  try {
    const { rows } = await db.query<EventRow>(
      `select event, created_at from workflow_events
        where job_id = $1
        order by created_at asc`,
      [jobId]
    );
    return rows;
  } catch {
    return [];
  }
}

function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export default async function StatusPage({ params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId);
  if (!job) return notFound();
  const events = await getEvents(params.jobId);

  const currentIdx = STAGE_ORDER.indexOf(job.stage as typeof STAGE_ORDER[number]);
  const isDelivered = job.stage === "delivered";
  const display = job.display_id ?? job.id;
  const summary = job.memory?.report?.executiveSummary as string | undefined;
  const readiness = job.memory?.qa?.submissionReadiness as number | string | undefined;
  const quality = job.memory?.qa?.qualityScore as number | string | undefined;
  const intake = (job.upload_meta?.intake ?? {}) as Record<string, string>;
  const clientName = [intake.firstName, intake.lastName].filter(Boolean).join(" ") || null;

  return (
    <section className="bg-canvas min-h-screen">
      {/* Auto-refresh every 30s while job isn't delivered */}
      {!isDelivered && (
        <meta httpEquiv="refresh" content="30" />
      )}

      <div className="container py-10 max-w-4xl">
        {/* Header */}
        <div className="eyebrow">Submission · {display}</div>
        <h1 className="mt-3 h-display-serif text-[32px] lg:text-[40px] leading-tight">
          {isDelivered
            ? "Your review is ready."
            : clientName
            ? `Thanks, ${intake.firstName} — your dissertation is in the pipeline.`
            : "Your dissertation is in the pipeline."}
        </h1>
        <p className="mt-3 text-[15px] text-ink-700">
          <span className="font-medium text-ink-900">{job.filename}</span> ·{" "}
          {job.word_count?.toLocaleString() ?? "—"} words · submitted {fmtTime(job.created_at)}
        </p>

        <div className="mt-8 grid lg:grid-cols-12 gap-6">
          {/* Pipeline timeline */}
          <div className="lg:col-span-7 card p-7">
            <div className="flex items-baseline justify-between">
              <div className="eyebrow">Live pipeline</div>
              {!isDelivered && (
                <span className="text-[11px] text-ink-500 italic">Auto-refreshes every 30s</span>
              )}
            </div>
            <ol className="mt-5 space-y-4">
              {STAGE_ORDER.map((stageKey, i) => {
                const done = i < currentIdx || isDelivered;
                const active = i === currentIdx && !isDelivered;
                const matchingEvent = events.find((e) => e.event === STAGE_EVENT_MAP[stageKey]);
                return (
                  <li key={stageKey} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${
                        done
                          ? "bg-emerald-100 text-emerald-700"
                          : active
                          ? "bg-amber-100 text-amber-700"
                          : "bg-ink-100 text-ink-400"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : active ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[14px] ${
                          done ? "text-ink-900" : active ? "text-ink-900 font-medium" : "text-ink-500"
                        }`}
                        dangerouslySetInnerHTML={{ __html: STAGE_LABEL[stageKey] }}
                      />
                      <div className="text-[12.5px] text-ink-500 mt-0.5">
                        {done && matchingEvent ? (
                          <>Completed {fmtTime(matchingEvent.created_at)}</>
                        ) : active ? (
                          <>{STAGE_HELPER[stageKey]}</>
                        ) : (
                          <span className="italic text-ink-400">{STAGE_HELPER[stageKey]}</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Side rail */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="card-quiet p-6">
              <div className="eyebrow">Submission details</div>
              <dl className="mt-3 space-y-2 text-[13.5px]">
                <Row k="Submission ID" v={display} mono />
                <Row k="Filename" v={job.filename} />
                <Row k="Word count" v={job.word_count?.toLocaleString() ?? "—"} />
                <Row k="Submitted" v={fmtTime(job.created_at)} />
                <Row k="Status" v={STAGE_LABEL[job.stage]?.replace(/&amp;/g, "&") ?? job.stage} />
                {readiness !== undefined && <Row k="Readiness score" v={`${readiness}/100`} />}
                {quality !== undefined && <Row k="Quality score" v={`${quality}/100`} />}
              </dl>
            </div>

            {clientName && (
              <div className="card-quiet p-6">
                <div className="eyebrow">Your information on file</div>
                <dl className="mt-3 space-y-2 text-[13.5px]">
                  {clientName && <Row k="Name" v={clientName} />}
                  {intake.email && <Row k="Email" v={intake.email} />}
                  {intake.university && <Row k="University" v={intake.university} />}
                  {intake.degreeProgram && <Row k="Program" v={intake.degreeProgram} />}
                  {intake.serviceRequested && <Row k="Service" v={intake.serviceRequested} />}
                </dl>
              </div>
            )}

            <div className="card-quiet p-6">
              <div className="eyebrow">Questions?</div>
              <ul className="mt-3 space-y-2 text-[13.5px] text-ink-800">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-ink-500 shrink-0" />
                  <a href="mailto:slouisjean@nxaihorizon.com" className="underline underline-offset-4">
                    slouisjean@nxaihorizon.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-ink-500 shrink-0" />
                  <a href="tel:+14078508823" className="underline underline-offset-4">(407) 850-8823</a>
                </li>
                <li className="text-[12.5px] text-ink-500 italic">Reference your submission ID: <span className="font-mono">{display}</span></li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Delivered package */}
        {isDelivered && summary && (
          <div className="mt-8 card p-7">
            <div className="flex items-baseline justify-between gap-4">
              <div className="eyebrow">Executive summary</div>
              <div className="flex gap-2">
                {readiness !== undefined && <span className="pill-accent">Readiness {readiness}/100</span>}
                {quality !== undefined && <span className="pill-neutral">QA {quality}/100</span>}
              </div>
            </div>
            <div className="mt-5 prose-academic text-[14.5px] leading-[1.7] text-ink-800 whitespace-pre-wrap">
              {summary}
            </div>
            <div className="mt-7 pt-5 border-t border-ink-100 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-secondary">Open dashboard</Link>
              <Link href="/upload" className="btn-primary">Submit another chapter</Link>
            </div>
          </div>
        )}

        {!isDelivered && (
          <div className="mt-8 card-quiet p-6">
            <div className="eyebrow">While you wait — common questions</div>
            <dl className="mt-4 space-y-4 text-[13.5px] text-ink-700">
              <FAQItem
                q="How long does this usually take?"
                a="Standard turnaround is 24 hours. Doctoral plans run on a 12–24 hour queue; Dissertation Intensive runs on a 6–12 hour rush queue."
              />
              <FAQItem
                q="What do I receive?"
                a="An annotated PDF with page-anchored findings, an APA 7 report, a methodology alignment summary, a citation cross-check, and a prioritized revision plan."
              />
              <FAQItem
                q="Will this feel like AI-generated feedback?"
                a="No. Every finding references a verbatim excerpt and is filtered by a QA agent that rejects generic, template-driven output."
              />
              <FAQItem
                q="Can I edit my submitted document?"
                a="The submission is locked at upload to preserve the audit record. Make your revisions and submit a new version when ready."
              />
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

function Row({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 items-baseline">
      <dt className="text-ink-500 shrink-0">{k}</dt>
      <dd className={`text-ink-900 text-right truncate ${mono ? "font-mono text-[12.5px]" : ""}`}>{v}</dd>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <dt className="text-ink-900 font-medium">{q}</dt>
      <dd className="mt-1 text-ink-600">{a}</dd>
    </div>
  );
}
