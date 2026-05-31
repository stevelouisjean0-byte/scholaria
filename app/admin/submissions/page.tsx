import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { CheckCircle2, Clock, Loader2, AlertTriangle, ArrowUpRight, Download } from "lucide-react";
import { JobActions } from "./JobActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  display_id: string | null;
  filename: string;
  stage: string;
  word_count: number | null;
  size_bytes: number | null;
  reviews_received: number;
  reviews_expected: number;
  upload_meta: any;
  created_at: Date;
  updated_at: Date;
  submission_readiness: string | null;
  quality_score: string | null;
}

const STAGE_PILL: Record<string, string> = {
  uploaded: "bg-ink-100 text-ink-700",
  intake: "bg-blue-100 text-blue-800",
  scoping: "bg-blue-100 text-blue-800",
  reviewing: "bg-amber-100 text-amber-800",
  qa: "bg-amber-100 text-amber-800",
  delivering: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800"
};

function StageIcon({ stage }: { stage: string }) {
  if (stage === "delivered") return <CheckCircle2 className="h-3 w-3" />;
  if (stage === "failed") return <AlertTriangle className="h-3 w-3" />;
  if (stage === "uploaded") return <Clock className="h-3 w-3" />;
  return <Loader2 className="h-3 w-3 animate-spin" />;
}

function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}
function fmtSize(b: number | null): string {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export default async function SubmissionsPage() {
  const admin = await requireAdmin();
  if (!admin) return null;

  let jobs: JobRow[] = [];
  let byStage: Record<string, number> = {};
  try {
    const r = await db.query(`
      select id, display_id, filename, stage, word_count, size_bytes,
             reviews_received, reviews_expected, upload_meta, created_at, updated_at,
             memory->'qa'->>'submissionReadiness' as submission_readiness,
             memory->'qa'->>'qualityScore' as quality_score
        from jobs
        order by created_at desc
        limit 200
    `);
    jobs = r.rows as JobRow[];
    const s = await db.query(`select stage, count(*)::int as n from jobs group by stage`);
    for (const row of s.rows) byStage[row.stage] = row.n;
  } catch (err) {
    console.error("[admin/submissions] load failed:", err);
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1500px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Submissions ledger</div>
          <h1 className="mt-3 h-display-serif text-[28px] lg:text-[34px] leading-tight">
            {jobs.length} most recent submissions
          </h1>
        </div>
        <a
          href="/api/admin/jobs?limit=500"
          className="btn-secondary inline-flex items-center gap-2"
          target="_blank"
          rel="noopener"
        >
          <Download className="h-4 w-4" /> Export JSON
        </a>
      </div>

      {/* Stage breakdown */}
      <div className="mt-6 grid grid-cols-3 sm:grid-cols-7 gap-2">
        {(["uploaded", "intake", "scoping", "reviewing", "qa", "delivering", "delivered"] as const).map((s) => (
          <div key={s} className="card-quiet p-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">{s}</div>
            <div className="mt-1 font-serif text-[22px] tabular text-ink-900">{byStage[s] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 card overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-10 text-center text-ink-500">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[1100px]">
              <thead className="bg-paper border-b border-ink-100">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="py-3 pl-5 pr-4 font-medium">Submission</th>
                  <th className="py-3 pr-4 font-medium">Client</th>
                  <th className="py-3 pr-4 font-medium">Manuscript</th>
                  <th className="py-3 pr-4 font-medium">Words · Size</th>
                  <th className="py-3 pr-4 font-medium">Stage</th>
                  <th className="py-3 pr-4 font-medium">Score</th>
                  <th className="py-3 pr-4 font-medium">Created</th>
                  <th className="py-3 pr-5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {jobs.map((j) => {
                  const intake = (j.upload_meta?.intake ?? {}) as Record<string, string>;
                  const clientName = [intake.firstName, intake.lastName].filter(Boolean).join(" ");
                  const display = j.display_id ?? j.id;
                  return (
                    <tr key={j.id} className="hover:bg-paper transition">
                      <td className="py-3.5 pl-5 pr-4 align-top">
                        <div className="font-mono text-[12px] text-ink-900">{display}</div>
                        {j.display_id && <div className="font-mono text-[10px] text-ink-400 mt-0.5">{j.id.slice(0, 10)}</div>}
                      </td>
                      <td className="py-3.5 pr-4 align-top">
                        {clientName ? (
                          <>
                            <div className="text-ink-900">{clientName}</div>
                            {intake.email && <div className="text-[11.5px] text-ink-500 truncate max-w-[180px]">{intake.email}</div>}
                            {intake.university && <div className="text-[11px] text-ink-400 truncate max-w-[180px]">{intake.university}</div>}
                          </>
                        ) : (
                          <span className="text-ink-400 italic text-[12px]">anonymous</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 align-top">
                        <div className="text-ink-900 truncate max-w-[240px]" title={j.filename}>{j.filename}</div>
                        {intake.chapterUploaded && <div className="text-[11px] text-ink-500 mt-0.5 truncate max-w-[240px]">{intake.chapterUploaded}</div>}
                      </td>
                      <td className="py-3.5 pr-4 align-top text-ink-700">
                        <div className="tabular">{j.word_count?.toLocaleString() ?? "—"}</div>
                        <div className="text-[11px] text-ink-400">{fmtSize(j.size_bytes)}</div>
                      </td>
                      <td className="py-3.5 pr-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${STAGE_PILL[j.stage] ?? "bg-ink-100 text-ink-700"}`}>
                          <StageIcon stage={j.stage} />
                          {j.stage}
                        </span>
                        {j.reviews_expected > 0 && (
                          <div className="text-[10px] text-ink-500 mt-1">{j.reviews_received}/{j.reviews_expected}</div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 align-top tabular">
                        {j.submission_readiness ? (
                          <>
                            <div className="text-ink-900 font-medium">{j.submission_readiness}/100</div>
                            {j.quality_score && <div className="text-[11px] text-ink-500">QA {j.quality_score}</div>}
                          </>
                        ) : <span className="text-ink-300">—</span>}
                      </td>
                      <td className="py-3.5 pr-4 align-top text-ink-600 whitespace-nowrap">{fmtTime(j.created_at)}</td>
                      <td className="py-3.5 pr-5 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          <Link href={`/status/${j.id}`} className="inline-flex items-center gap-1 text-ink-900 hover:underline underline-offset-4 text-[12px]">
                            Open <ArrowUpRight className="h-3 w-3" />
                          </Link>
                          <JobActions jobId={j.id} stage={j.stage} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
