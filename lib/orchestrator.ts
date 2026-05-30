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
import { AgentKey, resolveAgentId } from "./agents";

function agentIsConfigured(key: string): boolean {
  try {
    resolveAgentId(key as AgentKey);
    return true;
  } catch {
    return false;
  }
}
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

  // Default fanout — every reviewing agent we know about. Graceful
  // degradation: filter to whatever the runtime has resolvable IDs for,
  // so the platform works whether the user has built 1 agent or all of
  // them. If nothing is configured, fall through to research_intelligence
  // (we always treat that as the canonical baseline reviewer once an
  // API key is present) so the workflow never queues zero reviewers.
  const preferred = scope.assignedAgents.length
    ? scope.assignedAgents
    : (["professional_editor", "research_support", "research_intelligence"] as AgentKey[]);

  const fanout = (preferred as string[]).filter(agentIsConfigured) as AgentKey[];
  const effective: AgentKey[] = fanout.length > 0 ? fanout : ["research_intelligence"];

  for (const agent of effective) {
    await queue(QUEUE_NAMES.review).add("review", { jobId, agent });
  }
  await db.query("update jobs set reviews_expected=$2 where id=$1", [jobId, effective.length]);
  await recordWorkflowEvent(jobId, "fanout.assigned", { effective });
}

// Coerces a few well-known variations the model sometimes returns so we accept
// the review even if it strayed slightly from the canonical schema.
const severitySchema = z
  .union([z.enum(["minor", "moderate", "major"]), z.string()])
  .transform((v) => {
    const s = String(v).toLowerCase();
    if (["blocker", "critical", "high", "severe"].includes(s)) return "major" as const;
    if (["medium", "med", "warn", "warning"].includes(s)) return "moderate" as const;
    if (["low", "info", "trivial", "nit"].includes(s)) return "minor" as const;
    if (["minor", "moderate", "major"].includes(s)) return s as "minor" | "moderate" | "major";
    return "moderate" as const;
  });

const typeSchema = z
  .union([
    z.enum(["tone", "clarity", "formatting", "citation", "synthesis", "methodology", "structure"]),
    z.string()
  ])
  .transform((v) => {
    const s = String(v).toLowerCase();
    const allowed = ["tone", "clarity", "formatting", "citation", "synthesis", "methodology", "structure"] as const;
    if ((allowed as readonly string[]).includes(s)) return s as (typeof allowed)[number];
    if (s.includes("cit")) return "citation";
    if (s.includes("method")) return "methodology";
    if (s.includes("synth") || s.includes("literature")) return "synthesis";
    if (s.includes("struct") || s.includes("organiz") || s.includes("organis")) return "structure";
    if (s.includes("apa") || s.includes("format")) return "formatting";
    if (s.includes("clarity") || s.includes("clear")) return "clarity";
    return "tone";
  });

const findingSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    page: z.union([z.number(), z.string()]).optional(),
    section: z.string().optional(),
    excerpt: z.string().optional().default(""),
    issue: z.string().optional().default(""),
    recommendation: z.string().optional().default(""),
    severity: severitySchema.optional().default("moderate"),
    type: typeSchema.optional().default("tone")
  })
  .transform((f, ctx) => ({
    ...f,
    id: f.id !== undefined ? String(f.id) : `f-${ctx.path.join("-")}-${Math.random().toString(36).slice(2, 8)}`,
    page: typeof f.page === "string" ? parseInt(f.page, 10) || undefined : f.page
  }));

// Coerces null/string/number to a 0-100 number. Agents sometimes return
// "scholarlyTone": null when they have no opinion — accept it.
const score = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return undefined;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    if (isNaN(n)) return undefined;
    return Math.max(0, Math.min(100, n));
  });

const reviewSchema = z
  .object({
    agentKey: z.string().optional(),
    scholarlyTone: score.transform((v) => v ?? 0),
    clarity: score.transform((v) => v ?? 0),
    apaCompliance: score,
    literatureSynthesis: score,
    methodologyAlignment: score,
    citationAccuracy: score,
    findings: z.array(findingSchema).optional().default([]),
    summary: z.union([z.string(), z.null()]).optional().transform((v) => v ?? "")
  })
  .passthrough();

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
        // Cap the manuscript context at ~12k chars (~3k tokens) so the request
        // budget stays predictable. If the document is longer, the review focuses
        // on the opening — the cross-chapter pass covers depth separately.
        text: typeof job.text_full === "string" ? job.text_full.slice(0, 12000) : job.text_full
      }
    },
    system:
      "Respond with a SINGLE JSON object — no markdown, no code fence, no prose before or after. " +
      "Do NOT wrap the response in {\"review\":...} or any envelope. The JSON object itself IS the response. " +
      "Required shape (extra fields permitted, missing optional fields default to null/empty):\n" +
      "{\n" +
      "  \"scholarlyTone\": 0-100,\n" +
      "  \"clarity\": 0-100,\n" +
      "  \"apaCompliance\": 0-100,            // optional\n" +
      "  \"methodologyAlignment\": 0-100,     // optional\n" +
      "  \"citationAccuracy\": 0-100,         // optional\n" +
      "  \"summary\": \"2-3 sentence executive overview\",\n" +
      "  \"findings\": [\n" +
      "    { \"page\": 12, \"section\": \"§2.3\", \"excerpt\": \"verbatim text...\",\n" +
      "      \"issue\": \"what is wrong\", \"recommendation\": \"specific fix\",\n" +
      "      \"severity\": \"minor|moderate|major\",\n" +
      "      \"type\": \"tone|clarity|formatting|citation|synthesis|methodology|structure\" }\n" +
      "  ]\n" +
      "}\n" +
      "Every finding must reference a real excerpt from the manuscript verbatim. " +
      "Write findings in a calm, scholarly, executive register — explicit, specific, actionable. " +
      "Do not write replacement prose for entire sections; recommend changes the student should make. " +
      "Cap findings at 8 highest-severity items per pass.",
    maxTokens: 4000,
    model: process.env.ANTHROPIC_REVIEW_MODEL ?? "claude-haiku-4-5-20251001",
    bypassManagedAgent: true
  });

  const parsed = reviewSchema.parse(parseJson<AgentReview>(out.text));
  const review = { ...parsed, agentKey: parsed.agentKey ?? agent } as AgentReview;
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
  const priorAttempts = ((mem as any).qaAttempts ?? 0) + 1;
  await writeMemory(jobId, { qa, qaAttempts: priorAttempts } as any);
  await recordWorkflowEvent(jobId, "qa.complete", { ...qa, attempt: priorAttempts });

  const MAX_QA_ATTEMPTS = 3;
  if (!qa.passed && priorAttempts < MAX_QA_ATTEMPTS) {
    // Recovery: requeue the weakest review based on QA notes.
    await recordWorkflowEvent(jobId, "qa.recovery_triggered", { notes: qa.notes, attempt: priorAttempts });
    await queue(QUEUE_NAMES.review).add("review", { jobId, agent: "professional_editor" });
    return;
  }

  if (!qa.passed) {
    // Out of retries — deliver anyway with low scores recorded so the
    // student still gets feedback rather than the job stalling forever.
    await recordWorkflowEvent(jobId, "qa.recovery_exhausted", { attempt: priorAttempts });
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

  // Send completion email to the student and a delivery-confirmation
  // ping to the owner inbox. Failures are non-fatal — the deliverable
  // is already persisted and viewable via /status and /dashboard.
  try {
    const intake = (mem.intake ?? {}) as Record<string, any>;
    const studentEmail = String(intake.email ?? "").trim();
    const firstName = String(intake.firstName ?? "").trim() || undefined;
    const fullName = [intake.firstName, intake.lastName].filter(Boolean).join(" ").trim();

    // Pull the canonical display_id and filename from Postgres so the
    // email matches the on-site display exactly.
    const { rows } = await db.query(
      "select display_id, filename from jobs where id=$1",
      [jobId]
    );
    const displayId = (rows[0]?.display_id as string | undefined) ?? jobId;
    const filename = (rows[0]?.filename as string | undefined) ?? "your manuscript";

    const { sendMail, reviewReadyEmail, ownerDeliveryEmail } = await import("./email");

    if (studentEmail) {
      const mail = reviewReadyEmail({
        to: studentEmail,
        jobId,
        displayId,
        filename,
        firstName,
        readiness: mem.qa?.submissionReadiness,
        quality: mem.qa?.qualityScore,
        executiveSummary: report.executiveSummary,
        revisionPlan: report.revisionPlan
      });
      const res = await sendMail(mail);
      await recordWorkflowEvent(jobId, "notify.student", {
        to: studentEmail,
        ok: res.ok,
        id: res.id,
        error: res.error
      });
    } else {
      await recordWorkflowEvent(jobId, "notify.student.skipped", { reason: "no_email" });
    }

    const ownerInbox = process.env.OWNER_INBOX_ADDRESS;
    if (ownerInbox) {
      const ownerMail = ownerDeliveryEmail({
        to: ownerInbox,
        jobId,
        displayId,
        studentEmail,
        fullName,
        filename,
        readiness: mem.qa?.submissionReadiness,
        quality: mem.qa?.qualityScore
      });
      const res = await sendMail(ownerMail);
      await recordWorkflowEvent(jobId, "notify.owner", {
        to: ownerInbox,
        ok: res.ok,
        id: res.id,
        error: res.error
      });
    }
  } catch (err) {
    await recordWorkflowEvent(jobId, "notify.error", {
      message: err instanceof Error ? err.message : String(err)
    });
  }
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

/**
 * Robust JSON extraction for agent output. Handles:
 *   - clean JSON
 *   - markdown code fences (with or without closing fence)
 *   - text wrapped around JSON ("Here is the review: {...}")
 *   - single-key envelopes ({review: {...}}, {data: {...}}, etc.) — unwrapped
 */
function parseJson<T>(text: string): T {
  let raw = text.trim();

  // Strip leading code fence with optional language tag.
  raw = raw.replace(/^```(?:json|JSON)?\s*\n?/, "");
  // Strip trailing code fence if present.
  raw = raw.replace(/\n?```\s*$/, "");
  raw = raw.trim();

  // If raw doesn't start with { or [, try to find the first JSON object/array in the text.
  if (!raw.startsWith("{") && !raw.startsWith("[")) {
    const start = raw.search(/[{[]/);
    if (start >= 0) raw = raw.slice(start);
  }
  // Trim anything after the last closing brace/bracket.
  const lastBrace = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  if (lastBrace > 0 && lastBrace < raw.length - 1) {
    raw = raw.slice(0, lastBrace + 1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Agent did not return parseable JSON. First 200 chars: ${raw.slice(0, 200)}`);
  }

  // Unwrap common single-key envelopes. Order matters: more specific keys first.
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed);
    if (keys.length === 1) {
      const sole = keys[0].toLowerCase();
      if (["review", "data", "result", "output", "response", "json", "payload"].includes(sole)) {
        parsed = parsed[keys[0]];
      }
    }
  }

  return parsed as T;
}
