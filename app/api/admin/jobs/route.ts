import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin status endpoint — read-only summary of every job in the ledger.
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` if CRON_SECRET is set.
 *
 * Returns the row count by stage and the most recent 25 jobs with their stage,
 * filename, word count, reviews_received/expected, and a slice of jobs.memory
 * (executive summary if present) so we can confirm the pipeline ran without
 * having to open the Supabase Table Editor.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const filterId = url.searchParams.get("id");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100", 10) || 100, 500);

  const byStage = await db.query(
    "select stage, count(*)::int as n from jobs group by stage order by stage"
  );

  const recent = await db.query(
    filterId
      ? `select id, display_id, filename, stage, word_count, reviews_received, reviews_expected,
                upload_meta, updated_at, created_at,
                memory->'report'->>'executiveSummary' as executive_summary,
                memory->'qa'->>'submissionReadiness' as submission_readiness,
                memory->'qa'->>'qualityScore' as quality_score,
                jsonb_object_keys(coalesce(memory->'reviews','{}'::jsonb)) as review_keys
           from jobs
          where id = $1 or display_id = $1`
      : `select id, display_id, filename, stage, word_count, reviews_received, reviews_expected,
                upload_meta, updated_at, created_at,
                memory->'report'->>'executiveSummary' as executive_summary,
                memory->'qa'->>'submissionReadiness' as submission_readiness,
                memory->'qa'->>'qualityScore' as quality_score,
                jsonb_object_keys(coalesce(memory->'reviews','{}'::jsonb)) as review_keys
           from jobs
          order by created_at desc
          limit $1`,
    filterId ? [filterId] : [limit]
  );

  // Group review_keys per job (jsonb_object_keys returns one row per key).
  const jobsMap = new Map<string, any>();
  for (const r of recent.rows) {
    let row = jobsMap.get(r.id);
    if (!row) {
      row = { ...r, reviews_completed: [] as string[] };
      delete row.review_keys;
      jobsMap.set(r.id, row);
    }
    if (r.review_keys) row.reviews_completed.push(r.review_keys);
  }

  return NextResponse.json({
    ok: true,
    byStage: byStage.rows,
    recent: Array.from(jobsMap.values())
  });
}
