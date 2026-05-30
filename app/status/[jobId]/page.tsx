import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  filename: string;
  stage: string;
  created_at: Date;
  updated_at: Date;
  word_count: number | null;
  reviews_received: number;
  reviews_expected: number;
  memory: any;
}

const STAGE_ORDER = [
  "uploaded",
  "intake",
  "scoping",
  "reviewing",
  "qa",
  "delivering",
  "delivered"
] as const;

const STAGE_LABEL: Record<string, string> = {
  uploaded: "Manuscript received",
  intake: "Lead Intake — capturing context",
  scoping: "Project Scoping — routing review",
  reviewing: "Editor & methodology review in progress",
  qa: "QA & Final Approval",
  delivering: "Assembling your final package",
  delivered: "Review complete — package ready"
};

async function getJob(jobId: string): Promise<JobRow | null> {
  try {
    const { rows } = await db.query(
      `select id, filename, stage, created_at, updated_at, word_count,
              reviews_received, reviews_expected, memory
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

export default async function StatusPage({ params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId);
  if (!job) return notFound();

  const currentIdx = STAGE_ORDER.indexOf(job.stage as typeof STAGE_ORDER[number]);
  const isDelivered = job.stage === "delivered";
  const summary = job.memory?.report?.executiveSummary as string | undefined;
  const readiness = job.memory?.qa?.submissionReadiness as number | string | undefined;
  const quality = job.memory?.qa?.qualityScore as number | string | undefined;

  return (
    <section className="bg-canvas min-h-screen">
      <div className="container py-10 max-w-3xl">
        <div className="eyebrow">Review status · {job.id}</div>
        <h1 className="mt-3 h-display text-display-lg">{job.filename}</h1>
        <p className="mt-3 text-[14.5px] text-ink-600">
          {job.word_count?.toLocaleString() ?? "—"} words ·{" "}
          uploaded {new Date(job.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}
        </p>

        {/* Pipeline timeline */}
        <div className="mt-10 card p-6">
          <div className="eyebrow">Pipeline</div>
          <ol className="mt-4 space-y-3">
            {STAGE_ORDER.map((stage, i) => {
              const done = i < currentIdx || isDelivered;
              const active = i === currentIdx && !isDelivered;
              return (
                <li key={stage} className="flex items-start gap-3">
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
                  <div>
                    <div
                      className={`text-[14px] ${
                        done ? "text-ink-900" : active ? "text-ink-900 font-medium" : "text-ink-500"
                      }`}
                    >
                      {STAGE_LABEL[stage]}
                    </div>
                    {active && (
                      <div className="text-[12.5px] text-ink-500 mt-0.5">
                        In progress — refresh in a few minutes
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Delivered package */}
        {isDelivered && summary && (
          <div className="mt-8 card p-7">
            <div className="flex items-baseline justify-between gap-4">
              <div className="eyebrow">Executive summary</div>
              <div className="flex gap-2">
                {readiness !== undefined && (
                  <span className="pill-accent">
                    Readiness {readiness}/100
                  </span>
                )}
                {quality !== undefined && (
                  <span className="pill-neutral">QA {quality}/100</span>
                )}
              </div>
            </div>
            <div className="mt-5 prose-academic text-[14.5px] leading-[1.7] text-ink-800 whitespace-pre-wrap">
              {summary}
            </div>
            <div className="mt-7 pt-5 border-t border-ink-100 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-secondary">
                Open dashboard
              </Link>
              <Link href="/upload" className="btn-primary">
                Submit another chapter
              </Link>
            </div>
          </div>
        )}

        {!isDelivered && (
          <div className="mt-8 rounded-xl bg-amber-50 ring-1 ring-amber-700/15 p-5 text-[14px] text-amber-900">
            <strong className="font-semibold">We'll email you the moment it's ready.</strong>{" "}
            Typical turnaround is 24 hours (6–12 hours on Dissertation Intensive). You can leave
            this page — no need to wait here.
          </div>
        )}
      </div>
    </section>
  );
}
