/**
 * Scholaria — Background workers.
 *
 * Each queue has a dedicated worker. The Orchestrator state machine itself is
 * implemented in lib/orchestrator.ts; this file just binds queue events to the
 * corresponding workflow handlers.
 *
 *   pnpm run worker
 */
import { worker, QUEUE_NAMES } from "@/lib/queue";
import {
  runIntake,
  runScoping,
  runReview,
  runQA,
  runDelivery
} from "@/lib/orchestrator";
import { invokeAgent } from "@/lib/claude";
import { db } from "@/lib/db";
import { readMemory } from "@/lib/memory";

worker<{ jobId: string }>(QUEUE_NAMES.intake, async (j) => runIntake(j.data.jobId));
worker<{ jobId: string }>(QUEUE_NAMES.scope, async (j) => runScoping(j.data.jobId));
worker<{ jobId: string; agent: any }>(QUEUE_NAMES.review, async (j) =>
  runReview(j.data.jobId, j.data.agent)
);
worker<{ jobId: string }>(QUEUE_NAMES.qa, async (j) => runQA(j.data.jobId));
worker<{ jobId: string }>(QUEUE_NAMES.delivery, async (j) => runDelivery(j.data.jobId));

worker<{ jobId: string }>(QUEUE_NAMES.notify, async (j) => {
  const mem = await readMemory(j.data.jobId);
  const { rows } = await db.query("select user_id, filename from jobs where id=$1", [j.data.jobId]);
  await invokeAgent({
    agent: "client_support",
    jobId: j.data.jobId,
    task:
      "Notify this student that their autonomous scholarly review is complete. Use a calm, " +
      "warm, executive scholarly register. Reference the manuscript by filename and the executive summary. " +
      "Keep it to four short paragraphs. Never sound like a marketing email.",
    context: { user: rows[0], report: mem.report }
  });
});

console.log("[scholaria] workers online —", Object.values(QUEUE_NAMES).join(", "));
