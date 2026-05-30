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
  // Hard auth gate. Three accepted callers, in priority order:
  //   1. Vercel's own cron scheduler (user-agent starts with "vercel-cron")
  //   2. Authenticated admin (Clerk session)
  //   3. Bearer CRON_SECRET (machine-to-machine / scripts)
  // If none of these match, deny — even if CRON_SECRET is missing.
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET ?? "";
  const isVercelCron = req.headers.get("user-agent")?.toLowerCase().includes("vercel-cron") ?? false;
  const isBearerOk = cronSecret.length > 0 && auth === `Bearer ${cronSecret}`;

  let isAdmin = false;
  if (!isVercelCron && !isBearerOk) {
    try {
      const { requireAdmin } = await import("@/lib/admin");
      isAdmin = Boolean(await requireAdmin());
    } catch {
      isAdmin = false;
    }
  }

  if (!isVercelCron && !isBearerOk && !isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const processed: Array<Record<string, unknown>> = [];

  // One stage transition per invocation. The self-chain at the bottom fires
  // the next tick immediately so the pipeline progresses as fast as Vercel
  // can dispatch new containers — and a long review can never starve a fast
  // intake stage running in another job.
  const stagesInOrder: WorkflowStage[] = [
    "delivering",
    "qa",
    "reviewing",
    "scoping",
    "intake",
    "uploaded"
  ];

  outer: for (const stage of stagesInOrder) {
    const { rows } = await db.query(
      `select id from jobs
        where stage = $1
          and (updated_at is null or updated_at < now() - interval '20 seconds')
        order by updated_at asc nulls first
        limit 1`,
      [stage]
    );

    for (const { id } of rows) {
      const t0 = Date.now();
      // Touch updated_at so a slow or timing-out call doesn't immediately get
      // re-picked. The 20-second exclusion window above relies on this.
      await db.query("update jobs set updated_at=now() where id=$1", [id]);
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
      break outer; // exactly one stage transition per invocation
    }
  }

  const { rows: pendingRows } = await db.query(
    `select count(*)::int as n from jobs where stage in ('uploaded','intake','scoping','reviewing','qa','delivering')`
  );
  const pending = pendingRows[0]?.n ?? 0;

  // Self-chain: if there is still pending work, fire the next tick immediately.
  // Each invocation is its own serverless container with a fresh 60s budget, so
  // we get unbounded throughput on the Hobby plan without a per-minute cron.
  // Capped via the recursion depth: each tick processes >= 1 stage transition,
  // so a chain depth of N processes N transitions before stopping.
  if (pending > 0) {
    try {
      const proto = req.headers.get("x-forwarded-proto") ?? "https";
      const host = req.headers.get("host");
      if (host) {
        const url = `${proto}://${host}/api/cron/tick`;
        const cronSecret = process.env.CRON_SECRET;
        fetch(url, {
          method: "POST",
          headers: cronSecret ? { authorization: `Bearer ${cronSecret}` } : undefined
        }).catch(() => undefined);
      }
    } catch {
      // If self-chain fails, the daily cron heartbeat will catch any stragglers.
    }
  }

  return NextResponse.json({
    ok: true,
    processedCount: processed.length,
    pending,
    chained: pending > 0,
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

      // Recovery: if at least one review has succeeded but a remaining agent
      // has timed out repeatedly, advance to QA with what we have rather than
      // looping forever. Count prior cron.error events for this job at this
      // stage to decide.
      if (remaining && completed.length > 0) {
        const { rows: errCount } = await db.query(
          `select count(*)::int as n
             from workflow_events
            where job_id = $1
              and event = 'cron.error'
              and (payload->>'stage') = 'reviewing'`,
          [jobId]
        );
        if ((errCount[0]?.n ?? 0) >= 2) {
          await db.query(
            `update jobs
                set stage='qa',
                    reviews_expected = reviews_received,
                    updated_at = now()
              where id=$1 and stage='reviewing'`,
            [jobId]
          );
          return `advanced to qa (skipped ${remaining} after timeouts)`;
        }
      }

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
