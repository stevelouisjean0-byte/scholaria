/**
 * Scholaria — Autonomous Workflow Orchestrator
 *
 * One coordinated ecosystem, not a chain of isolated prompts. The Orchestrator
 * Agent owns the workflow state machine; every reviewing agent reads from and
 * writes to the shared job memory document; the QA agent gates delivery.
 *
 *  intake → scope → fanout(reviews) → qa → delivery → notify
 *
 * Every transition is durable, replayable, and observable.
 */
import { invokeAgent } from "./claude";
import { AgentKey } from "./agents";
import {
  AgentReview,
  FinalReport,
  IntakeSnapshot,
  QASnapshot,
  ScopeSnapshot,
  readMemory,
  writeMemory
} from "./memory";
import { QUEUE_NAMES, queue } from "./queue";
import { db } from "./db";
import { recordWorkflowEvent } from "./telemetry";
import { z } from "zod";

export type WorkflowStage =
  | "uploaded"
  | "intake"
  | "scoping"
  | "reviewing"
  | "qa"
  | "delivering"
  | "delivered"
  | "failed";

export async function enqueueIntake(jobId: string) {
  await setStage(jobId, "intake");
  await queue(QUEUE_NAMES.intake).add("intake", { jobId });
  await recordWorkflowEvent(jobId, "queued.intake");
}

export async function runIntake(jobId: string) {
  const job = await loadJob(jobId);
  const out = await invokeAgent({
    agent: "lead_intake",
    jobId,
    task:
      "A new manuscript has been uploaded. Extract the intake snapshot the platform " +
      "needs to route this paper through the review pipeline. Return strict JSON matching the schema. " +
      "If a field cannot be confidently determined from the document or metadata, leave it empty rather than guessing.",
    context: {
      filename: job.filename,
      uploadMeta: job.upload_meta,
      excerpt: job.text_excerpt
    },
    system:
      "Respond with a single JSON object: " +
      `{ "degreeLevel": string, "assignmentType": string, "deadlineIso": string|null, ` +
      `"formattingStyle": "APA7"|"APA6"|"MLA"|"Chicago"|"Other", ` +
      `"professorFeedback": string, "areasOfConcern": string[] }`
  });

  const intake = parseJson<IntakeSnapshot>(out.text);
  await writeMemory(jobId, { intake });
  await recordWorkflowEvent(jobId, "intake.complete", intake);

  await setStage(jobId, "scoping");
  await queue(QUEUE_NAMES.scope).add("scope", { jobId });
}

export async function runScoping(jobId: string) {
  const mem = await readMemory(jobId);
  const out = await invokeAgent({
    agent: "project_scoping",
    jobId,
    task:
      "Given the intake snapshot for this manuscript, produce a scope decision: complexity, category, " +
      "service package, priority, and the set of reviewing agents that should be activated. Return strict JSON.",
    context: { intake: mem.intake },
    system:
      `Respond with a single JSON object: ` +
      `{ "complexity": "standard"|"advanced"|"intensive", "category": string, "servicePackage": string, ` +
      `"priority": "normal"|"rush"|"critical", ` +
      `"assignedAgents": ("professional_editor"|"research_support")[] }`
  });

  const scope = parseJson<ScopeSnapshot>(out.text);
  await writeMemory(jobId, { scope });
  await recordWorkflowEvent(jobId, "scope.complete", scope);

  await setStage(jobId, "reviewing");
  const fanout = scope.assignedAgents.length
    ? scope.assignedAgents
    : ["professional_editor", "research_support", "research_intelligence"];
  for (const agent of fanout) {
    await queue(QUEUE_NAMES.review).add("review", { jobId, agent });
  }
  await db.query("update jobs set reviews_expected=$2 where id=$1", [jobId, fanout.length]);
}

const reviewSchema = z.object({
  agentKey: z.string(),
  scholarlyTone: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  apaCompliance: z.number().min(0).max(100).optional(),
  literatureSynthesis: z.number().min(0).max(100).optional(),
  methodologyAlignment: z.number().min(0).max(100).optional(),
  citationAccuracy: z.number().min(0).max(100).optional(),
  findings: z.array(
    z.object({
      id: z.string(),
      page: z.number().optional(),
      section: z.string().optional(),
      excerpt: z.string(),
      issue: z.string(),
      recommendation: z.string(),
      severity: z.enum(["minor", "moderate", "major"]),
      type: z.enum(["tone", "clarity", "formatting", "citation", "synthesis", "methodology", "structure"])
    })
  ),
  summary: z.string()
});

export async function runReview(jobId: string, agent: AgentKey) {
  const job = await loadJob(jobId);
  const mem = await readMemory(jobId);

  const out = await invokeAgent({
    agent,
    jobId,
    task: reviewTaskFor(agent),
    context: {
      intake: mem.intake,
      scope: mem.scope,
      manuscript: {
        filename: job.filename,
        wordCount: job.word_count,
        text: job.text_full
      }
    },
    system:
      "Respond with a single JSON object conforming exactly to the review schema. " +
      "Every finding must reference a real excerpt from the manuscript verbatim. " +
      "Write findings in a calm, scholarly, executive register — explicit, specific, and actionable. " +
      "Do not write replacement prose for entire sections; recommend changes the student should make.",
    maxTokens: 6000
  });

  const review = reviewSchema.parse(parseJson<AgentReview>(out.text));
  await writeMemory(jobId, { reviews: { [agent]: review } });
  await recordWorkflowEvent(jobId, "review.complete", { agent });

  const counts = await db.query(
    `update jobs
       set reviews_received = reviews_received + 1, updated_at = now()
     where id = $1
     returning reviews_received, reviews_expected`,
    [jobId]
  );
  const { reviews_received, reviews_expected } = counts.rows[0];
  if (reviews_received >= reviews_expected) {
    await setStage(jobId, "qa");
    await queue(QUEUE_NAMES.qa).add("qa", { jobId });
  }
}

export async function runQA(jobId: string) {
  const mem = await readMemory(jobId);
  const out = await invokeAgent({
    agent: "qa_final",
    jobId,
    task:
      "Validate every reviewing agent's output. Score submission readiness and overall quality. " +
      "If any finding is malformed, internally inconsistent, or insufficiently actionable, mark passed=false " +
      "and explain precisely which review needs to be regenerated. Otherwise pass and provide notes.",
    context: { intake: mem.intake, scope: mem.scope, reviews: mem.reviews },
    system:
      `Respond with a single JSON object: ` +
      `{ "passed": boolean, "submissionReadiness": 0-100, "qualityScore": 0-100, "notes": string }`
  });

  const qa = parseJson<QASnapshot>(out.text);
  await writeMemory(jobId, { qa });
  await recordWorkflowEvent(jobId, "qa.complete", qa);

  if (!qa.passed) {
    // Recovery: requeue the weakest review based on QA notes.
    await recordWorkflowEvent(jobId, "qa.recovery_triggered", qa.notes);
    await queue(QUEUE_NAMES.review).add("review", { jobId, agent: "professional_editor" });
    return;
  }

  await setStage(jobId, "delivering");
  await queue(QUEUE_NAMES.delivery).add("delivery", { jobId });
}

export async function runDelivery(jobId: string) {
  const mem = await readMemory(jobId);
  // Synthesize the executive-level final package via the orchestrator agent.
  const out = await invokeAgent({
    agent: "orchestrator",
    jobId,
    task:
      "Assemble the final scholarly deliverable package. Produce an executive summary suitable for a doctoral " +
      "student and an ordered revision plan. Reference the deliverable artefacts the system will attach.",
    context: { intake: mem.intake, scope: mem.scope, reviews: mem.reviews, qa: mem.qa },
    system:
      `Respond with a single JSON object: ` +
      `{ "executiveSummary": string, "revisionPlan": string[], "deliverables": ` +
      `{ "label": string, "url": string, "kind": string }[] }`
  });
  const report = parseJson<FinalReport>(out.text);
  await writeMemory(jobId, { report });

  await setStage(jobId, "delivered");
  await queue(QUEUE_NAMES.notify).add("notify", { jobId });
  await recordWorkflowEvent(jobId, "delivery.complete");
}

function reviewTaskFor(agent: AgentKey): string {
  switch (agent) {
    case "professional_editor":
      return [
        "Review this manuscript as a senior dissertation editor.",
        "Score scholarly tone, clarity, and APA compliance where relevant.",
        "Surface specific tone, clarity, structure, and formatting issues with verbatim excerpts,",
        "explicit recommendations, and severity. Do not rewrite entire sections — guide the student."
      ].join(" ");
    case "research_support":
      return [
        "Review this manuscript's literature review, citations, synthesis, and methodology alignment.",
        "Score synthesis, methodology alignment, and citation accuracy.",
        "Identify gaps, weak transitions between theory and literature, missing or inconsistent references,",
        "and thematic organisation issues — with verbatim excerpts and explicit recommendations."
      ].join(" ");
    case "research_intelligence":
      return [
        "Run a research-intelligence pass over this manuscript: discover whether the cited literature is",
        "current and peer-reviewed, identify peer-reviewed sources the chapter is missing, verify reference",
        "list entries against scholarly databases, and surface gaps in the literature that the chapter",
        "should address. Score literatureSynthesis, methodologyAlignment, and citationAccuracy."
      ].join(" ");
    default:
      return "Produce a structured scholarly review of this manuscript.";
  }
}

async function setStage(jobId: string, stage: WorkflowStage) {
  await db.query("update jobs set stage=$2, updated_at=now() where id=$1", [jobId, stage]);
}

async function loadJob(jobId: string) {
  const { rows } = await db.query("select * from jobs where id=$1", [jobId]);
  if (!rows.length) throw new Error(`Job ${jobId} not found`);
  return rows[0];
}

function parseJson<T>(text: string): T {
  // Tolerate the occasional code fence around the JSON payload.
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (m ? m[1] : text).trim();
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`Agent did not return parseable JSON. First 200 chars: ${raw.slice(0, 200)}`);
  }
}
