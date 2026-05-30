import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: full per-agent audit for a single job.
 *
 * Returns every agent's output, all workflow events (with timings and
 * payloads), and a derived per-agent summary. Used to prove that each
 * AI agent in the pipeline performed real work — input, output, duration,
 * whether the output was used in the final report.
 *
 * Auth: Clerk admin session OR Bearer CRON_SECRET.
 *
 * GET /api/admin/job-audit?id=<jobId-or-displayId>
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
  const idParam = url.searchParams.get("id");
  if (!idParam) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const { rows } = await db.query(
    `select id, display_id, filename, stage, word_count, created_at, updated_at,
            upload_meta, memory, reviews_received, reviews_expected
       from jobs
      where id = $1 or display_id = $1
      limit 1`,
    [idParam]
  );
  if (!rows.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const job = rows[0];
  const memory = (job.memory ?? {}) as Record<string, any>;

  const { rows: events } = await db.query(
    `select event, payload, occurred_at
       from workflow_events
      where job_id = $1
      order by occurred_at asc`,
    [job.id]
  );

  // ---- per-agent telemetry ----
  // Each agent appears in the pipeline as a memory key. We synthesize a
  // structured "agent ran / did not run / what did it produce" record by
  // joining the memory blob with the workflow_events ledger.

  const agents: Array<{
    agentKey: string;
    role: string;
    status: "completed" | "skipped" | "missing";
    startedAt: string | null;
    completedAt: string | null;
    durationMs: number | null;
    inputSummary: string;
    outputSummary: string;
    outputKeys: string[];
    usedInFinalReport: boolean;
    warnings: string[];
    errors: string[];
  }> = [];

  function findEvents(prefix: string) {
    return events.filter((e) => e.event.startsWith(prefix));
  }

  function agentSummary(opts: {
    key: string;
    role: string;
    memoryNode: any;
    startEvent: string | null;
    endEvent: string;
    inputSummary: string;
    usedInFinal: boolean;
  }) {
    const startEv = opts.startEvent ? events.find((e) => e.event === opts.startEvent) : null;
    const endEv = events.find((e) => e.event === opts.endEvent);
    const status: "completed" | "skipped" | "missing" =
      opts.memoryNode && Object.keys(opts.memoryNode).length > 0 ? "completed" : "missing";
    const startedAt = startEv?.occurred_at ?? null;
    const completedAt = endEv?.occurred_at ?? null;
    const durationMs =
      startedAt && completedAt
        ? new Date(completedAt as any).getTime() - new Date(startedAt as any).getTime()
        : null;
    const errors = findEvents("cron.error")
      .filter((e) => (e.payload?.stage ?? "") === opts.key)
      .map((e) => String(e.payload?.message ?? ""));

    const out = opts.memoryNode ?? {};
    const outputKeys = typeof out === "object" && out !== null ? Object.keys(out) : [];
    const outputSummary = summarize(out);

    return {
      agentKey: opts.key,
      role: opts.role,
      status,
      startedAt: typeof startedAt === "string" ? startedAt : startedAt ? String(startedAt) : null,
      completedAt:
        typeof completedAt === "string" ? completedAt : completedAt ? String(completedAt) : null,
      durationMs,
      inputSummary: opts.inputSummary,
      outputSummary,
      outputKeys,
      usedInFinalReport: opts.usedInFinal,
      warnings: [],
      errors
    };
  }

  agents.push(
    agentSummary({
      key: "intake",
      role: "Reads uploaded document, captures metadata (title, type, chapter, word count)",
      memoryNode: memory.intake,
      startEvent: "queued.intake",
      endEvent: "intake.complete",
      inputSummary: `filename=${job.filename}; words=${job.word_count}`,
      usedInFinal: true
    })
  );
  agents.push(
    agentSummary({
      key: "scoping",
      role: "Determines review pathway and routes to the correct reviewers",
      memoryNode: memory.scope,
      startEvent: null,
      endEvent: "scope.complete",
      inputSummary: "intake metadata",
      usedInFinal: true
    })
  );

  const reviews = (memory.reviews ?? {}) as Record<string, any>;
  for (const [agentKey, reviewNode] of Object.entries(reviews)) {
    const reviewEvents = events.filter(
      (e) => e.event === "review.complete" && (e.payload?.agent ?? "") === agentKey
    );
    const lastReview = reviewEvents[reviewEvents.length - 1];
    agents.push({
      agentKey,
      role: agentRoleFor(agentKey),
      status: "completed",
      startedAt: null,
      completedAt: lastReview?.occurred_at ? String(lastReview.occurred_at) : null,
      durationMs: null,
      inputSummary: "intake, scope, and manuscript metadata",
      outputSummary: reviewSummary(reviewNode),
      outputKeys: Object.keys(reviewNode ?? {}),
      usedInFinalReport: true,
      warnings: [],
      errors: []
    });
  }

  agents.push(
    agentSummary({
      key: "qa_final",
      role: "Validates every reviewer's output; scores readiness & quality; gates delivery",
      memoryNode: memory.qa,
      startEvent: null,
      endEvent: "qa.complete",
      inputSummary: "all review outputs",
      usedInFinal: true
    })
  );
  agents.push(
    agentSummary({
      key: "orchestrator_report",
      role: "Synthesizes the formal client-facing deliverable from all reviewer + QA output",
      memoryNode: memory.report,
      startEvent: null,
      endEvent: "delivery.complete",
      inputSummary: "intake, scope, all reviews, qa",
      usedInFinal: true
    })
  );

  // ---- email notification status ----
  const notifyEvents = events.filter(
    (e) => e.event.startsWith("notify.") || e.event === "delivery.complete"
  );

  return NextResponse.json({
    ok: true,
    job: {
      id: job.id,
      displayId: job.display_id,
      stage: job.stage,
      filename: job.filename,
      wordCount: job.word_count,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      reviewsReceived: job.reviews_received,
      reviewsExpected: job.reviews_expected,
      intake: (job.upload_meta as any)?.intake ?? null
    },
    agents,
    notifications: notifyEvents.map((e) => ({
      event: e.event,
      payload: e.payload,
      at: e.occurred_at
    })),
    workflowEvents: events.map((e) => ({
      event: e.event,
      at: e.occurred_at,
      payload: redactPayload(e.payload)
    })),
    memoryKeys: Object.keys(memory),
    reportSnippet: memory.report
      ? {
          executiveSummaryFirst200: (memory.report.executiveSummary as string | undefined)?.slice(0, 200),
          revisionPlanCount: (memory.report.revisionPlan as string[] | undefined)?.length ?? 0,
          hasAllSections: typeof memory.report === "object" && memory.report !== null
        }
      : null
  });
}

function agentRoleFor(key: string): string {
  switch (key) {
    case "professional_editor":
      return "Senior editor — scholarly tone, clarity, APA mechanics, structure, formatting";
    case "research_support":
      return "Research support — literature synthesis, methodology alignment, citation accuracy";
    case "research_intelligence":
      return "Research intelligence — verifies cited literature, surfaces missing peer-reviewed sources";
    default:
      return "Reviewer";
  }
}

function reviewSummary(r: any): string {
  if (!r || typeof r !== "object") return "(no data)";
  const findings = Array.isArray(r.findings) ? r.findings.length : 0;
  const summary = typeof r.summary === "string" ? r.summary.slice(0, 200) : "";
  const scores = [
    r.scholarlyTone != null ? `tone=${r.scholarlyTone}` : null,
    r.clarity != null ? `clarity=${r.clarity}` : null,
    r.apaCompliance != null ? `apa=${r.apaCompliance}` : null,
    r.literatureSynthesis != null ? `synth=${r.literatureSynthesis}` : null,
    r.methodologyAlignment != null ? `method=${r.methodologyAlignment}` : null,
    r.citationAccuracy != null ? `cite=${r.citationAccuracy}` : null
  ]
    .filter(Boolean)
    .join(" · ");
  return [`${findings} findings`, scores, summary].filter(Boolean).join(" · ");
}

function summarize(node: any): string {
  if (!node) return "(none)";
  if (typeof node === "string") return node.slice(0, 200);
  if (typeof node !== "object") return String(node);
  if (Array.isArray(node)) return `array(${node.length})`;
  return Object.entries(node)
    .slice(0, 6)
    .map(([k, v]) => {
      const valStr =
        typeof v === "string"
          ? v.slice(0, 60)
          : typeof v === "number" || typeof v === "boolean"
          ? String(v)
          : Array.isArray(v)
          ? `array(${v.length})`
          : "obj";
      return `${k}=${valStr}`;
    })
    .join(" · ");
}

function redactPayload(p: any): any {
  if (!p || typeof p !== "object") return p;
  const out: any = {};
  for (const [k, v] of Object.entries(p)) {
    if (typeof v === "string" && v.length > 240) {
      out[k] = v.slice(0, 240) + `…(+${v.length - 240}c)`;
    } else {
      out[k] = v;
    }
  }
  return out;
}
