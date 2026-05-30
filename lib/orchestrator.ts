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
  FormalReport,
  IntakeSnapshot,
  QASnapshot,
  ScopeSnapshot,
  readMemory,
  writeMemory
} from "./memory";
import { QUEUE_NAMES, enqueueOptional, type QueueName } from "./queue";
import { db } from "./db";
import { recordWorkflowEvent } from "./telemetry";
import { z } from "zod";
import { randomBytes } from "crypto";

export type WorkflowStage =
  | "uploaded"
  | "intake"
  | "scoping"
  | "reviewing"
  | "qa"
  | "delivering"
  | "delivered"
  | "needs_manual_review"
  | "failed";

async function enqueueWorkflowJob(
  jobId: string,
  queueName: QueueName,
  jobName: string,
  data: Record<string, unknown>
) {
  const result = await enqueueOptional(queueName, jobName, data);
  if (!result.ok && !result.skipped) {
    await recordWorkflowEvent(jobId, "queue.enqueue_failed", {
      queue: queueName,
      jobName,
      error: result.error
    });
  }
  return result;
}

function countWords(s: string): number {
  return (s ?? "").trim().split(/\s+/).filter(Boolean).length;
}

export async function enqueueIntake(jobId: string) {
  await setStage(jobId, "intake");
  await enqueueWorkflowJob(jobId, QUEUE_NAMES.intake, "intake", { jobId });
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
  await enqueueWorkflowJob(jobId, QUEUE_NAMES.scope, "scope", { jobId });
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
    await enqueueWorkflowJob(jobId, QUEUE_NAMES.review, "review", { jobId, agent });
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
    await enqueueWorkflowJob(jobId, QUEUE_NAMES.qa, "qa", { jobId });
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
    await enqueueWorkflowJob(jobId, QUEUE_NAMES.review, "review", { jobId, agent: "professional_editor" });
    return;
  }

  if (!qa.passed) {
    // Out of retries — deliver anyway with low scores recorded so the
    // student still gets feedback rather than the job stalling forever.
    await recordWorkflowEvent(jobId, "qa.recovery_exhausted", { attempt: priorAttempts });
  }

  await setStage(jobId, "delivering");
  await enqueueWorkflowJob(jobId, QUEUE_NAMES.delivery, "delivery", { jobId });
}

// Strict shape for the formal client-facing deliverable. The orchestrator
// is required to return every section; missing sections trigger a re-run.
const stringList = z
  .union([z.array(z.union([z.string(), z.null()])), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null) return [] as string[];
    if (typeof v === "string") return v.trim() ? [v.trim()] : [];
    return v.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  });

const formalReportSchema = z
  .object({
    cover: z
      .object({
        documentTitle: z.union([z.string(), z.null()]).optional().transform((v) => v ?? undefined),
        servicePurchased: z.union([z.string(), z.null()]).optional().transform((v) => v ?? undefined),
        completedAt: z.union([z.string(), z.null()]).optional().transform((v) => v ?? "")
      })
      .partial()
      .transform((v) => ({
        documentTitle: v.documentTitle,
        servicePurchased: v.servicePurchased,
        completedAt: v.completedAt ?? ""
      })),
    executiveSummary: z.string().min(1, "executiveSummary is required"),
    scoreExplanations: z
      .object({
        readiness: z.union([z.string(), z.null()]).optional().transform((v) => v ?? ""),
        quality: z.union([z.string(), z.null()]).optional().transform((v) => v ?? "")
      })
      .default({ readiness: "", quality: "" }),
    strengths: z
      .array(
        z.object({
          heading: z.string(),
          explanation: z.string(),
          evidence: z.union([z.string(), z.null()]).optional().transform((v) => v ?? undefined),
          academicSignificance: z.string()
        })
      )
      .default([]),
    priorityRevisions: z
      .array(
        z.object({
          issue: z.string(),
          rationale: z.string(),
          location: z.union([z.string(), z.null()]).optional().transform((v) => v ?? undefined),
          remedy: z.string(),
          exampleRewrite: z.union([z.string(), z.null()]).optional().transform((v) => v ?? undefined)
        })
      )
      .default([]),
    apaReview: z
      .object({
        overall: z.union([z.string(), z.null()]).optional().transform((v) => v ?? ""),
        findings: z
          .array(
            z.object({
              area: z.string(),
              finding: z.string(),
              recommendation: z.string()
            })
          )
          .default([])
      })
      .default({ overall: "", findings: [] }),
    citationIntegrity: z
      .object({
        overall: z.union([z.string(), z.null()]).optional().transform((v) => v ?? ""),
        missingReferences: stringList,
        uncitedReferences: stringList,
        weakOrOutdatedSources: stringList,
        notes: z.union([z.string(), z.null()]).optional().transform((v) => v ?? "")
      })
      .default({
        overall: "",
        missingReferences: [],
        uncitedReferences: [],
        weakOrOutdatedSources: [],
        notes: ""
      }),
    scholarlyTone: z
      .object({
        overall: z.union([z.string(), z.null()]).optional().transform((v) => v ?? ""),
        observations: stringList,
        suggestedEdits: z
          .array(
            z.object({
              excerpt: z.string(),
              revised: z.string(),
              rationale: z.string()
            })
          )
          .default([])
      })
      .default({ overall: "", observations: [], suggestedEdits: [] }),
    alignmentReview: z
      .object({
        overall: z.union([z.string(), z.null()]).optional().transform((v) => v ?? ""),
        elements: z
          .array(
            z.object({
              element: z.string(),
              assessment: z.string()
            })
          )
          .default([])
      })
      .default({ overall: "", elements: [] }),
    chapterSpecificReview: z
      .object({
        sectionType: z.string().default("General"),
        sections: z
          .array(
            z.object({
              topic: z.string(),
              finding: z.string(),
              recommendation: z.string()
            })
          )
          .default([])
      })
      .default({ sectionType: "General", sections: [] }),
    revisionPlan: z
      .object({
        first: stringList,
        second: stringList,
        third: stringList
      })
      .default({ first: [], second: [], third: [] }),
    finalRecommendation: z.string().min(1, "finalRecommendation is required")
  })
  .passthrough();

const BANNED_PHRASES = [
  "still needs sits",
  "this is non-negotiable",
  "held down by blockers",
  "chair-ready status",
  "the spine of the chapter",
  "quickly toward"
];

function formalReportSystem(): string {
  return [
    "You are the Report Writer Agent for a paid academic editing service.",
    "Your single job is to assemble the formal client-facing deliverable from the reviewer + QA findings",
    "you receive in context. The deliverable must read like a polished executive academic review prepared",
    "by a senior editor — not a chatbot, not an internal note, not a checklist.",
    "",
    "REQUIRED REGISTER:",
    "  • Formal, professional, executive-level, scholarly, specific, detailed, organized, respectful, actionable.",
    "  • Calm, evidence-based, third-person prose. Never casual, never breezy, never marketing copy.",
    "  • Address the student in second person sparingly and only when professionally appropriate.",
    "  • Use complete sentences. Avoid em-dash flourishes, rhetorical questions, and superlatives.",
    "",
    "BANNED PHRASES (do not use any of these or close variants — they sound informal or awkward):",
    BANNED_PHRASES.map((p) => `    – \"${p}\"`).join("\n"),
    "",
    "OUTPUT — a SINGLE valid JSON object with EXACTLY these keys (no markdown, no code fence, no envelope,",
    "no commentary before or after). Every field must be populated; never return null where the schema",
    "expects a string or array.",
    "",
    "{",
    '  "cover": {',
    '    "documentTitle": string | null,            // best inferred from filename/intake',
    '    "servicePurchased": string | null,         // intake.serviceRequested if present',
    '    "completedAt": string                      // ISO-8601 — leave "" if unknown; system will fill',
    "  },",
    '  "executiveSummary": string,                  // REQUIRED: 250–400 words, formal academic register.',
    "                                              // Must summarize document quality, name top strengths,",
    "                                              // name most urgent revisions, and justify the readiness score.",
    '  "scoreExplanations": {',
    '    "readiness": string,                       // paragraph explaining what the readiness number means,',
    "                                              // why it was assigned, what blocks a higher score,",
    "                                              // what to fix first, and a realistic post-revision range.",
    '    "quality": string                          // paragraph explaining the QA quality score.',
    "  },",
    '  "strengths": [                               // AT LEAST 5 entries, document-specific (no boilerplate).',
    "    { \"heading\": string, \"explanation\": string,",
    "      \"evidence\": string | null, \"academicSignificance\": string }",
    "  ],",
    '  "priorityRevisions": [                       // AT LEAST 5 entries, ordered by urgency.',
    "    { \"issue\": string, \"rationale\": string, \"location\": string | null,",
    "      \"remedy\": string, \"exampleRewrite\": string | null }",
    "  ],",
    '  "apaReview": {',
    '    "overall": string,                         // 2–4 sentence assessment of APA 7 conformance',
    '    "findings": [ { "area": string, "finding": string, "recommendation": string } ]',
    "  },",
    '  "citationIntegrity": {',
    '    "overall": string,',
    '    "missingReferences": string[],             // citations in text that are absent from the reference list',
    '    "uncitedReferences": string[],             // reference-list entries never cited in the body',
    '    "weakOrOutdatedSources": string[],',
    '    "notes": string                            // include fabrication-risk flags here when warranted',
    "  },",
    '  "scholarlyTone": {',
    '    "overall": string,',
    '    "observations": string[],                  // sentence-clarity, voice, transitions, redundancy, vague claims',
    '    "suggestedEdits": [ { "excerpt": string, "revised": string, "rationale": string } ]',
    "  },",
    '  "alignmentReview": {',
    '    "overall": string,                         // alignment among problem/purpose/RQ/framework/method/sample/analysis',
    '    "elements": [ { "element": string, "assessment": string } ]',
    "  },",
    '  "chapterSpecificReview": {',
    '    "sectionType": string,                     // "Chapter 1" | "Chapter 2" | "Chapter 3" | "Research paper" | "Other"',
    '    "sections": [ { "topic": string, "finding": string, "recommendation": string } ]',
    "  },",
    '  "revisionPlan": {',
    '    "first": string[],                         // urgent — fix before anything else',
    '    "second": string[],                        // strengthen these areas',
    '    "third": string[]                          // polish details',
    "  },",
    '  "finalRecommendation": string                // professional closing: is it submission-ready, what to revise',
    "                                              // first, how close the document is to a stronger version, next step.",
    "}",
    "",
    "GROUND TRUTH RULES:",
    "  • Do not invent citations, sources, page numbers, or manuscript details. If the reviewer findings did",
    "    not surface a fact, do not assert it.",
    "  • If the upload is clearly not a scholarly manuscript (test file, system message, checklist scaffold),",
    "    the cover, executiveSummary, and finalRecommendation must say so respectfully and the body sections",
    "    should explain why substantive review was not possible — but still return the full schema.",
    "  • Tailor language to the document type detected in intake / chapterSpecificReview.sectionType.",
    "  • Every list above has a MINIMUM count where stated. Meeting the minimum with thin filler is not",
    "    acceptable; each entry must be document-specific and immediately actionable."
  ].join("\n");
}

function backfillFormalReportCover(
  report: FormalReport,
  ctx: { displayId: string; filename: string; servicePurchased?: string }
): FormalReport {
  return {
    ...report,
    cover: {
      documentTitle: report.cover?.documentTitle ?? ctx.filename,
      servicePurchased: report.cover?.servicePurchased ?? ctx.servicePurchased,
      completedAt: report.cover?.completedAt && report.cover.completedAt.length > 0
        ? report.cover.completedAt
        : new Date().toISOString()
    }
  };
}

function reportContainsBannedPhrase(report: FormalReport): string | null {
  const blob = JSON.stringify(report).toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (blob.includes(phrase.toLowerCase())) return phrase;
  }
  return null;
}

export async function runDelivery(jobId: string) {
  const mem = await readMemory(jobId);

  const { rows } = await db.query(
    "select display_id, filename from jobs where id=$1",
    [jobId]
  );
  const displayId = (rows[0]?.display_id as string | undefined) ?? jobId;
  const filename = (rows[0]?.filename as string | undefined) ?? "your manuscript";
  const servicePurchased = ((mem.intake ?? {}) as any).serviceRequested as string | undefined;

  // Up to three attempts: first pass, retry on schema fail, retry on banned phrases.
  let formal: FormalReport | null = null;
  let lastErr: string | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const extraGuard =
      attempt > 1
        ? `\n\nPREVIOUS ATTEMPT REJECTED: ${lastErr}. Repair the issue and return a clean valid JSON object that conforms exactly to the schema above. Do NOT include any commentary about this rejection in the output.`
        : "";
    const out = await invokeAgent({
      agent: "orchestrator",
      jobId,
      task:
        "Assemble the formal client-facing deliverable for this manuscript. Use the reviewer and QA findings " +
        "in context as your evidence base. Produce all twelve required sections of the JSON schema with " +
        "executive-level academic prose. Adhere strictly to the schema — every section must be populated.",
      context: {
        intake: mem.intake,
        scope: mem.scope,
        reviews: mem.reviews,
        qa: mem.qa,
        manuscript: { filename, displayId, servicePurchased }
      },
      system: formalReportSystem() + extraGuard,
      // Haiku 4.5 default — large structured outputs (12 sections, ~6k tokens)
      // can take 30-60s wall-clock when the prompt + context is large. The
      // 100s timeoutMs only kicks in on /api/admin/rerun-delivery
      // (maxDuration=120). On the cron tick (maxDuration=60) Vercel terminates
      // before this timeout fires, which is the desired behaviour — the next
      // tick will retry. Sonnet via env override yields higher prose polish.
      // 8000 tokens accommodates the full 12-section response with prose
      // for 5+ strengths / 5+ revisions without truncation. Truncated JSON
      // is unrecoverable for a deeply nested schema.
      maxTokens: 8000,
      timeoutMs: 110_000,
      model: process.env.ANTHROPIC_REPORT_MODEL ?? "claude-haiku-4-5-20251001",
      bypassManagedAgent: true
    });

    try {
      const parsed = formalReportSchema.parse(parseJson<FormalReport>(out.text));
      const reportWithCover = backfillFormalReportCover(parsed, {
        displayId,
        filename,
        servicePurchased
      });
      const banned = reportContainsBannedPhrase(reportWithCover);
      if (banned && attempt < 3) {
        lastErr = `Output contained banned phrase: "${banned}". Rewrite without it using formal academic language.`;
        await recordWorkflowEvent(jobId, "report.banned_phrase", { phrase: banned, attempt });
        continue;
      }
      formal = reportWithCover;
      await recordWorkflowEvent(jobId, "report.generated", {
        attempt,
        executiveSummaryWords: countWords(formal.executiveSummary),
        strengths: formal.strengths.length,
        revisions: formal.priorityRevisions.length
      });
      break;
    } catch (err) {
      lastErr = err instanceof Error ? err.message.slice(0, 240) : "schema validation failed";
      await recordWorkflowEvent(jobId, "report.parse_failed", { attempt, message: lastErr });
      if (attempt === 3) {
        // Out of retries — escalate to manual review.
        await setStage(jobId, "needs_manual_review");
        await recordWorkflowEvent(jobId, "report.escalated_manual_review", { reason: lastErr });
        return;
      }
    }
  }

  if (!formal) {
    await setStage(jobId, "needs_manual_review");
    await recordWorkflowEvent(jobId, "report.no_output");
    return;
  }

  // Persist BOTH the new formalReport and a legacy `report` shape so the
  // existing email + status-page code paths continue to work.
  const legacyReport: FinalReport = {
    executiveSummary: formal.executiveSummary,
    revisionPlan: [
      ...formal.revisionPlan.first.map((s) => `First: ${s}`),
      ...formal.revisionPlan.second.map((s) => `Second: ${s}`),
      ...formal.revisionPlan.third.map((s) => `Third: ${s}`)
    ],
    deliverables: [
      {
        label: "Full PDF report",
        url: `/api/jobs/${jobId}/report.pdf`,
        kind: "pdf"
      }
    ]
  };
  await writeMemory(jobId, { formalReport: formal, report: legacyReport });
  const report = legacyReport;

  await setStage(jobId, "delivered");
  await enqueueWorkflowJob(jobId, QUEUE_NAMES.notify, "notify", { jobId });
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
      "select display_id, filename, upload_meta from jobs where id=$1",
      [jobId]
    );
    const displayId = (rows[0]?.display_id as string | undefined) ?? jobId;
    const filename = (rows[0]?.filename as string | undefined) ?? "your manuscript";
    let deliveryToken = (rows[0]?.upload_meta?.deliveryToken as string | undefined) ?? undefined;
    if (!deliveryToken) {
      deliveryToken = randomBytes(24).toString("base64url");
      await db.query(
        `update jobs
            set upload_meta = coalesce(upload_meta, '{}'::jsonb) || jsonb_build_object('deliveryToken', $2::text),
                updated_at = now()
          where id = $1`,
        [jobId, deliveryToken]
      );
    }

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
        revisionPlan: report.revisionPlan,
        deliveryToken
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
/**
 * Best-effort repair for JSON that was truncated mid-value because the
 * agent hit its max_tokens cap. Walks the string tracking string/escape
 * state and brace depth, then truncates at the last balanced position and
 * closes any remaining open containers. Returns null if no recoverable
 * structure can be found.
 */
function repairTruncatedJson(raw: string): string | null {
  if (!raw || (raw[0] !== "{" && raw[0] !== "[")) return null;

  let inString = false;
  let escape = false;
  const stack: Array<"}" | "]"> = [];
  let lastSafeIndex = -1;
  let lastSafeStack: Array<"}" | "]"> = [];

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (c === "{") stack.push("}");
    else if (c === "[") stack.push("]");
    else if (c === "}" || c === "]") {
      stack.pop();
    } else if (c === ",") {
      // After a complete key:value pair at the top of the current container,
      // it's safe to truncate here and close the remaining containers.
      lastSafeIndex = i;
      lastSafeStack = [...stack];
    }
  }

  if (lastSafeIndex < 0) return null;
  return raw.slice(0, lastSafeIndex) + lastSafeStack.reverse().join("");
}

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
    // Last-resort repair: the response may have been truncated mid-value
    // (max_tokens cap). Walk back to the last comma at the top level, drop
    // anything after it, then close all open braces/brackets. This recovers
    // partial output instead of escalating an entire 12-section deliverable
    // because one field overflowed.
    const repaired = repairTruncatedJson(raw);
    if (repaired !== null) {
      try {
        parsed = JSON.parse(repaired);
      } catch {
        throw new Error(`Agent did not return parseable JSON. First 200 chars: ${raw.slice(0, 200)}`);
      }
    } else {
      throw new Error(`Agent did not return parseable JSON. First 200 chars: ${raw.slice(0, 200)}`);
    }
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
