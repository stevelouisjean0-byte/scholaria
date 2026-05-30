import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin status endpoint — read-only summary of every job in the ledger.
 * Auth (two paths):
 *   - Signed-in admin (via Clerk + admins table)  →  human/browser access
 *   - Authorization: Bearer <CRON_SECRET>           →  machine/test scripts
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    const auth = req.headers.get("authorization") ?? "";
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const filterId = url.searchParams.get("id");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100", 10) || 100, 500);

  const byStage = await db.query(
    "select stage, count(*)::int as n from jobs group by stage order by stage"
  );

  // NOTE: jsonb_object_keys() is a set-returning function — in a top-level
  // SELECT it drops rows whose review set is empty (kills any fresh upload).
  // Use a correlated subquery to fold the keys into an array per row instead.
  const SELECT_COLS = `
    id, display_id, filename, stage, word_count, reviews_received, reviews_expected,
    upload_meta, updated_at, created_at,
    memory->'report'->>'executiveSummary' as executive_summary,
    memory->'qa'->>'submissionReadiness' as submission_readiness,
    memory->'qa'->>'qualityScore' as quality_score,
    coalesce(
      (select array_agg(k) from jsonb_object_keys(coalesce(memory->'reviews','{}'::jsonb)) k),
      '{}'
    ) as reviews_completed
  `;

  const recent = await db.query(
    filterId
      ? `select ${SELECT_COLS} from jobs where id = $1 or display_id = $1`
      : `select ${SELECT_COLS} from jobs order by created_at desc limit $1`,
    filterId ? [filterId] : [limit]
  );

  return NextResponse.json({
    ok: true,
    byStage: byStage.rows,
    recent: recent.rows
  });
}
