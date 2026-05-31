import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { recordWorkflowEvent } from "@/lib/telemetry";

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

  const existing = await db.query(
    "select id, display_id, stage, memory from jobs where id=$1 or display_id=$1",
    [id]
  );
  if (!existing.rowCount) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (stage === "delivered") {
    const missingDeliverable = existing.rows.some((row) => !hasDeliverable(row.memory));
    if (missingDeliverable) {
      return NextResponse.json(
        {
          error: "missing_deliverable",
          detail: "A job cannot be marked delivered until a report exists in memory.",
          hint: "Let cron finish the pipeline, or rerun delivery after QA/report generation succeeds."
        },
        { status: 409 }
      );
    }
  }

  const { rowCount, rows } = await db.query(
    "update jobs set stage=$2, updated_at=now() where id=$1 or display_id=$1 returning id, display_id, stage",
    [id, stage]
  );
  if (!rowCount) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await Promise.all(
    rows.map((row, index) =>
      recordWorkflowEvent(row.id, "admin.stage_reset", {
        from: existing.rows[index]?.stage,
        to: stage
      })
    )
  );
  return NextResponse.json({ ok: true, jobs: rows });
}

function hasDeliverable(memory: unknown) {
  if (!memory || typeof memory !== "object") return false;
  const mem = memory as Record<string, unknown>;
  return Boolean(mem.formalReport || mem.report);
}
