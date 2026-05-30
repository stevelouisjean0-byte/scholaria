import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { runDelivery } from "@/lib/orchestrator";

export const runtime = "nodejs";
// Vercel Hobby tier caps functions at 60s — values higher than 60 are
// silently downgraded. The orchestrator's report call is sized to fit
// comfortably inside this budget (~30-40s Haiku call + DB/email overhead).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Admin-only: re-run the delivery stage for a job that has already been
 * delivered. Used to regenerate the executive deliverable after the formal-
 * report pipeline upgrade so existing clients get the new polished output
 * (and the completion email) without re-uploading.
 *
 * Side effects:
 *   - Re-invokes the orchestrator (Sonnet, ~12k token budget) to produce a
 *     fresh FormalReport. Costs real Anthropic credits.
 *   - Triggers the student + owner notification emails (runDelivery handles
 *     these). To suppress the student email, omit OWNER_INBOX_ADDRESS — but
 *     to suppress the student email itself you must temporarily clear
 *     intake.email; this endpoint does not provide a flag to skip it.
 *
 * Auth: Clerk admin session OR Bearer CRON_SECRET.
 *
 * POST /api/admin/rerun-delivery?id=<jobId-or-displayId>
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    const auth = req.headers.get("authorization") ?? "";
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  if (!idParam) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const { rows } = await db.query(
    "select id, stage from jobs where id=$1 or display_id=$1 limit 1",
    [idParam]
  );
  if (!rows.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const job = rows[0];
  if (job.stage !== "delivered" && job.stage !== "needs_manual_review") {
    return NextResponse.json(
      { error: "bad_state", stage: job.stage, note: "only delivered or needs_manual_review may be re-run" },
      { status: 400 }
    );
  }

  // Move to delivering so the cron self-chain does not pick it up while we
  // run synchronously. runDelivery will move it back to delivered (or to
  // needs_manual_review if the new formal schema can't validate).
  await db.query("update jobs set stage='delivering', updated_at=now() where id=$1", [job.id]);

  const startedAt = Date.now();
  try {
    await runDelivery(job.id);
  } catch (err) {
    return NextResponse.json(
      {
        error: "delivery_failed",
        message: err instanceof Error ? err.message : String(err),
        ms: Date.now() - startedAt
      },
      { status: 500 }
    );
  }

  const { rows: post } = await db.query(
    "select stage, memory->'formalReport' as formal_report, memory->'qa' as qa from jobs where id=$1",
    [job.id]
  );

  return NextResponse.json({
    ok: true,
    jobId: job.id,
    stage: post[0]?.stage,
    formalReportPresent: Boolean(post[0]?.formal_report),
    qa: post[0]?.qa ?? null,
    ms: Date.now() - startedAt
  });
}
