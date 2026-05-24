import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readMemory } from "@/lib/memory";
import { runIntake, runScoping, runReview, runQA, runDelivery, WorkflowStage } from "@/lib/orchestrator";
import { invokeAgent } from "@/lib/claude";
import type { AgentKey } from "@/lib/agents";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Serverless cron that drives the autonomous workflow on Vercel.
 *
 * The state machine lives in `lib/orchestrator.ts`. Each stage transition is a
 * single Claude call followed by a `setStage` update in Postgres. Postgres is
 * the source of truth — Redis queues are still populated for observability but
 * the cron consumer reads `jobs.stage` directly, so we do not need a separate
 * worker process.
 *
 * Invocation paths:
 *   - Scheduled by Vercel Cron (see vercel.json) at the configured frequency.
 *   - Triggered eagerly by /api/upload after a fresh job is enqueued, so a
 *     student does not have to wait a full cron interval to see their first
 *     stage transition.
 *   - Available as a manual admin endpoint (Authorization: Bearer <CRON_SECRET>)
 *     for recovering stuck jobs.
 *
 * Each invocation processes as many jobs as fits inside maxDuration, ranked by
 * stage so jobs closest to delivery progress first.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron") ?? false;
  if (cronSecret && !isVercelCron && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const DEADLINE_MS = 50_000;
  const processed: Array<Record<string, unknown>> = [];

  const stagesInOrder: WorkflowStage[] = [
    "delivering",
    "qa",
    "reviewing",
    "scoping",
    "intake",
    "uploaded"
  ];

  for (const stage of stagesInOrder) {
    if (Date.now() - startedAt > DEADLINE_MS) break;

    const { rows } = await db.query(
      `select id from jobs
        where stage = $1
          and (updated_at is null or updated_at < now() - interval '30 seconds')
        order by updated_at asc nulls first
        limit 5`,
      [stage]
    );

    for (const { id } of rows) {
      if (Date.now() - startedAt > DEADLINE_MS) break;
      const t0 = Date.now();
      try {
        const result = await advance(id, stage);
        processed.push({ jobId: id, stage, result, ms: Date.now() - t0 });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        processed.push({ jobId: id, stage, error: message, ms: Date.now() - t0 });
        await db.query(
          `insert into workflow_events (job_id, event, payload)
           values ($1, 'cron.error', $2::jsonb)`,
          [id, JSON.stringify({ stage, message })]
        );
      }
    }
  }

  const { rows: pendingRows } = await db.query(
    `select count(*)::int as n from jobs where stage in ('uploaded','intake','scoping','reviewing','qa','delivering')`
  );
  const pending = pendingRows[0]?.n ?? 0;

  return NextResponse.json({
    ok: true,
    processedCount: processed.length,
    pending,
    ms: Date.now() - startedAt,
    processed
  });
}

async function advance(jobId: string, stage: WorkflowStage): Promise<string> {
  switch (stage) {
    case "uploaded":
    case "intake":
      await runIntake(jobId);
      return "intake.complete";

    case "scoping":
      await runScoping(jobId);
      return "scope.complete";

    case "reviewing": {
      const mem = await readMemory(jobId);
      const assigned: AgentKey[] =
        (mem.scope?.assignedAgents as AgentKey[] | undefined)?.length
          ? (mem.scope!.assignedAgents as AgentKey[])
          : (["professional_editor", "research_support"] as AgentKey[]);
      const completed = Object.keys(mem.reviews ?? {});
      const remaining = assigned.find((a) => !completed.includes(a));
      if (remaining) {
        await runReview(jobId, remaining);
        return `review.complete (${remaining})`;
      }
      await db.query(
        "update jobs set stage='qa', updated_at=now() where id=$1 and stage='reviewing'",
        [jobId]
      );
      return "advanced to qa";
    }

    case "qa":
      await runQA(jobId);
      return "qa.complete";

    case "delivering":
      await runDelivery(jobId);
      return "delivery.complete";

    default:
      return `noop (${stage})`;
  }
}

// POST mirror so the upload route (or any internal trigger) can kick off the
// loop synchronously without needing a GET fetch in a server context.
export async function POST(req: NextRequest) {
  return GET(req);
}
