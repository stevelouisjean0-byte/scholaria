import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: force-set a job's stage. Used to unstick jobs whose prior
 * delivery attempt crashed mid-stage (leaving them in "delivering" with no
 * cron worker to recover them) and to mark a low-quality delivered job as
 * needs_manual_review for human follow-up.
 *
 * Auth: Clerk admin session OR Bearer CRON_SECRET.
 *
 * POST /api/admin/reset-stage?id=<jobId-or-displayId>&stage=<target>
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
  const id = url.searchParams.get("id");
  const stage = url.searchParams.get("stage");
  const allowed = new Set([
    "uploaded",
    "intake",
    "scoping",
    "reviewing",
    "qa",
    "delivering",
    "delivered",
    "needs_manual_review",
    "failed"
  ]);
  if (!id || !stage) return NextResponse.json({ error: "missing_params" }, { status: 400 });
  if (!allowed.has(stage)) return NextResponse.json({ error: "bad_stage" }, { status: 400 });

  const { rowCount, rows } = await db.query(
    "update jobs set stage=$2, updated_at=now() where id=$1 or display_id=$1 returning id, display_id, stage",
    [id, stage]
  );
  if (!rowCount) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, jobs: rows });
}
