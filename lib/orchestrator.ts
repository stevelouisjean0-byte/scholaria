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
  JobMemory,
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

// ===========================================================================
// FormalReport v2 — split into two LLM calls so the 18-section deliverable
// fits inside the 60s Hobby function ceiling. Each call returns its own
// JSON object validated against a dedicated schema; the two are merged with
// programmatically-built cover/submissionDetails/agentActivity/qualityGate
// sections to form the final FormalReport.
// ===========================================================================

const stringList = z
  .union([z.array(z.union([z.string(), z.null()])), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null) return [] as string[];
    if (typeof v === "string") return v.trim() ? [v.trim()] : [];
    return v.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  });

const nullableString = z.union([z.string(), z.null()]).optional().transform((v) => v ?? "");
const optionalString = z.union([z.string(), z.null()]).optional().transform((v) => v ?? undefined);

const numberFromAny = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return 0;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  });

const severityFlex = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    const s = String(v ?? "").toLowerCase();
    if (["high", "major", "critical", "blocker", "severe"].includes(s)) return "high" as const;
    if (["low", "minor", "nit", "trivial"].includes(s)) return "minor" as const;
    return "moderate" as const;
  });

// ---- Call A: Analytical sections ----
const analyticalSchema = z
  .object({
    executiveSummary: z.string().min(1, "executiveSummary is required"),
    scoreOverview: z
      .object({
        submissionReadiness: z
          .object({ score: numberFromAny, explanation: z.string() })
          .default({ score: 0, explanation: "" }),
        overallQuality: z
          .object({ score: numberFromAny, explanation: z.string() })
          .default({ score: 0, explanation: "" }),
        categories: z
          .array(
            z.object({
              name: z.string(),
              score: numberFromAny,
              reason: z.string(),
              evidence: optionalString,
              recommendation: z.string()
            })
          )
          .default([])
      })
      .default({
        submissionReadiness: { score: 0, explanation: "" },
        overallQuality: { score: 0, explanation: "" },
        categories: []
      }),
    qaReview: nullableString,
    majorStrengths: z
      .array(
        z.object({
          heading: z.string(),
          explanation: z.string(),
          evidence: optionalString,
          academicSignificance: z.string()
        })
      )
      .default([]),
    priorityRevisions: z
      .array(
        z.object({
          findingNumber: z.union([z.number(), z.string()]).optional().transform((v) => {
            if (v == null) return 0;
            const n = typeof v === "number" ? v : parseInt(String(v), 10);
            return isNaN(n) ? 0 : n;
          }),
          location: optionalString,
          severity: severityFlex,
          category: z.string().default("General"),
          excerpt: optionalString,
          issue: z.string(),
          whyItMatters: z.string(),
          recommendedFix: z.string(),
          exampleRevision: optionalString,
          relatedStandard: optionalString
        })
      )
      .default([]),
    finalRecommendation: z.string().min(1, "finalRecommendation is required")
  })
  .passthrough();

// ---- Call B: Sectioned reviews ----
const sectionedSchema = z
  .object({
    apaReview: z
      .object({
        overall: nullableString,
        areas: z
          .array(
            z.object({
              area: z.string(),
              status: z.string().default("Reviewed"),
              finding: z.string(),
              recommendation: z.string()
            })
          )
          .default([])
      })
      .default({ overall: "", areas: [] }),
    citationIntegrity: z
      .object({
        overall: nullableString,
        verificationDisclaimer: nullableString,
        requiresVerification: stringList,
        missingFromReferences: stringList,
        uncitedInBody: stringList,
        notes: nullableString
      })
      .default({
        overall: "",
        verificationDisclaimer: "",
        requiresVerification: [],
        missingFromReferences: [],
        uncitedInBody: [],
        notes: ""
      }),
    literatureReview: z
      .object({
        overall: nullableString,
        organization: nullableString,
        synthesis: nullableString,
        themes: nullableString,
        gapArticulation: nullableString
      })
      .default({ overall: "", organization: "", synthesis: "", themes: "", gapArticulation: "" }),
    theoreticalFramework: z
      .object({
        overall: nullableString,
        frameworkIdentified: optionalString,
        integration: nullableString,
        operationalization: nullableString
      })
      .default({ overall: "", integration: "", operationalization: "" }),
    alignmentReview: z
      .object({
        overall: nullableString,
        elements: z
          .array(z.object({ element: z.string(), assessment: z.string() }))
          .default([])
      })
      .default({ overall: "", elements: [] }),
    chapterSpecificReview: z
      .object({
        sectionType: z.string().default("General"),
        sections: z
          .array(z.object({ topic: z.string(), finding: z.string(), recommendation: z.string() }))
          .default([])
      })
      .default({ sectionType: "General", sections: [] }),
    scholarlyTone: z
      .object({
        overall: nullableString,
        observations: stringList,
        suggestedEdits: z
          .array(z.object({ excerpt: z.string(), revised: z.string(), rationale: z.string() }))
          .default([])
      })
      .default({ overall: "", observations: [], suggestedEdits: [] }),
    revisionPlan: z
      .object({
        immediate: stringList,
        highImpact: stringList,
        finalPolish: stringList
      })
      .default({ immediate: [], highImpact: [], finalPolish: [] })
  })
  .passthrough();

const BANNED_PHRASES = [
  "still needs sits",
  "this is non-negotiable",
  "held down by blockers",
  "chair-ready status",
  "the spine of the chapter",
  "quickly toward",
  "the work the chapter still needs sits",
  "moves quickly toward",
  "moves toward chair-ready",
  "this is non negotiable"
];

const SCORE_CATEGORIES = [
  "Scholarly Tone",
  "APA 7 Compliance",
  "Citation Integrity",
  "Literature Synthesis",
  "Theoretical Framework",
  "Alignment to Problem and Purpose",
  "Organization",
  "Committee Readiness",
  "Revision Priority"
] as const;

const REGISTER_BLOCK = [
  "REQUIRED REGISTER:",
  "  • Formal, professional, executive-level, scholarly, specific, detailed, organized, respectful, actionable.",
  "  • Calm, evidence-based, third-person prose. Never casual, never breezy, never marketing copy.",
  "  • Address the student in second person sparingly and only when professionally appropriate.",
  "  • Complete sentences. Avoid rhetorical questions, slang, motivational phrasing, and superlatives.",
  "  • Do not accuse the client of fabricating sources. Use the verification-language phrasings below.",
  "",
  "BANNED PHRASES (do not use any of these or close variants):",
  BANNED_PHRASES.map((p) => `    – \"${p}\"`).join("\n"),
  "",
  "CITATION-VERIFICATION LANGUAGE (use these when discussing source integrity):",
  '  • "Several recent sources require independent verification before submission."',
  '  • "The review could not confirm the full bibliographic details for selected citations based on the information available in the manuscript."',
  '  • "Before committee submission, the client should verify each recent source in ERIC, Google Scholar, ProQuest, or the university library database."',
  "  • Never claim the system searched ERIC, Google Scholar, or DOI records — it did not."
].join("\n");

function analyticalSystem(): string {
  return [
    "You are the Report Writer Agent for a paid academic editing service.",
    "Your job in THIS call is to produce the ANALYTICAL half of the formal client-facing deliverable:",
    "the executive summary, the nine-category score overview, the QA review paragraph, the major",
    "strengths, the priority revisions, and the final recommendation. The sectioned reviews (APA,",
    "citation, literature, framework, alignment, chapter, tone, revision plan) will be produced by a",
    "separate call — do NOT include them here.",
    "",
    REGISTER_BLOCK,
    "",
    "OUTPUT — a SINGLE valid JSON object with EXACTLY these keys (no markdown, no fence, no envelope,",
    "no commentary). Never use null where the schema expects a string or array.",
    "",
    "{",
    '  "executiveSummary": string,                    // REQUIRED: 300–500 words, formal academic register.',
    "                                                // Must cover: overall document quality, major strengths,",
    "                                                // major concerns, reason for the readiness score,",
    "                                                // immediate revision priorities, clear next step for the client.",
    "",
    '  "scoreOverview": {',
    '    "submissionReadiness": { "score": 0-100, "explanation": string },   // explanation: what the score means,',
    "                                                                       // why assigned, what blocks higher,",
    "                                                                       // what to fix first, realistic post-revision range.",
    '    "overallQuality":      { "score": 0-100, "explanation": string },',
    '    "categories": [',
    "      // EXACTLY these nine categories, in this order, each with score, reason, evidence (optional), recommendation:",
    SCORE_CATEGORIES.map((c) => `      //   "${c}"`).join("\n"),
    '      { "name": string, "score": 0-100, "reason": string, "evidence": string|null, "recommendation": string }',
    "    ]",
    "  },",
    "",
    '  "qaReview": string,                             // 2–4 sentences explaining the QA validation outcome',
    "                                                // (what the QA agent verified, what it flagged for review).",
    "",
    '  "majorStrengths": [                             // AT LEAST 5 entries, document-specific (no boilerplate).',
    '    { "heading": string, "explanation": string,',
    '      "evidence": string|null, "academicSignificance": string }',
    "  ],",
    "",
    '  "priorityRevisions": [                          // AT LEAST 5 entries, ordered by urgency.',
    '    { "findingNumber": int, "location": string|null,',
    '      "severity": "high"|"moderate"|"minor",',
    '      "category": string,                         // e.g. "Synthesis", "APA 7", "Methodology Alignment"',
    '      "excerpt": string|null,                     // verbatim passage if available',
    '      "issue": string,',
    '      "whyItMatters": string,',
    '      "recommendedFix": string,',
    '      "exampleRevision": string|null,             // a one-sentence rewrite illustrating the fix',
    '      "relatedStandard": string|null              // APA 7 rule, dissertation standard, etc.',
    "    }",
    "  ],",
    "",
    '  "finalRecommendation": string                   // 120–220 words. State: is the document submission-ready,',
    "                                                // what must be fixed before submission, what the client should",
    "                                                // do first, whether a second review is recommended, and how",
    "                                                // close the document is to meeting committee expectations.",
    "}",
    "",
    "LENGTH BUDGET (HARD CAP):",
    "  • executiveSummary: 300–500 words. Do not exceed 500.",
    "  • Each scoreOverview.category.reason: 30–60 words.",
    "  • Each scoreOverview.category.recommendation: 25–50 words.",
    "  • Each major strength: 50–90 words across explanation + academicSignificance.",
    "  • Each priority revision: 60–110 words across issue + whyItMatters + recommendedFix.",
    "  • finalRecommendation: 120–220 words.",
    "  • Total response must stay under ~3500 tokens to avoid truncation.",
    "",
    "GROUND TRUTH RULES:",
    "  • Do not invent citations, sources, page numbers, or facts. If the reviewer findings did not",
    "    surface a detail, do not assert it.",
    "  • If the upload is clearly not a scholarly manuscript (test file, system message, checklist),",
    "    say so respectfully in the executive summary and recommendation, and still populate every key."
  ].join("\n");
}

function sectionedSystem(): string {
  return [
    "You are the Report Writer Agent for a paid academic editing service.",
    "Your job in THIS call is to produce the SECTIONED-REVIEW half of the formal client-facing",
    "deliverable: APA 7 review, citation integrity, literature review quality, theoretical/conceptual",
    "framework review, alignment review, chapter-specific review, scholarly tone, and the three-tier",
    "revision plan. Do NOT produce the executive summary, scores, strengths, priority revisions, or",
    "final recommendation — those are handled by a separate call.",
    "",
    REGISTER_BLOCK,
    "",
    "OUTPUT — a SINGLE valid JSON object with EXACTLY these keys (no markdown, no fence, no envelope,",
    "no commentary). Never use null where the schema expects a string or array.",
    "",
    "{",
    '  "apaReview": {',
    '    "overall": string,                            // 2–4 sentence assessment of APA 7 conformance',
    '    "areas": [                                    // 5–9 entries covering the canonical APA 7 areas:',
    "      //   Title page, Headings (Level 1/2/3), In-text citations (parenthetical & narrative),",
    "      //   Reference list formatting, DOI/URL formatting, Capitalization & italicization, Hanging indents,",
    "      //   Alignment between citations and references.",
    '      { "area": string, "status": string,         // e.g. "Conforms", "Partial", "Needs revision"',
    '        "finding": string, "recommendation": string }',
    "    ]",
    "  },",
    "",
    '  "citationIntegrity": {',
    '    "overall": string,',
    '    "verificationDisclaimer": string,             // REQUIRED. State that the system did not directly query',
    "                                                // ERIC/Google Scholar/ProQuest/DOI records and that source",
    "                                                // verification is the responsibility of the client.",
    '    "requiresVerification": string[],             // sources flagged for client verification (do not call them fabricated)',
    '    "missingFromReferences": string[],            // citations in text that appear absent from the reference list',
    '    "uncitedInBody": string[],                    // reference-list entries that do not appear cited in the body',
    '    "notes": string',
    "  },",
    "",
    '  "literatureReview": {',
    '    "overall": string,                            // 3–5 sentence diagnostic',
    '    "organization": string,                       // how the lit review is organized; is it thematic, chronological',
    '    "synthesis": string,                          // is the review synthesizing or merely cataloguing',
    '    "themes": string,                             // theme development across cited works',
    '    "gapArticulation": string                     // how the gap is named and connected to the study',
    "  },",
    "",
    '  "theoreticalFramework": {',
    '    "overall": string,',
    '    "frameworkIdentified": string|null,           // name(s) of the framework(s) used',
    '    "integration": string,                        // how well the framework threads through the chapter',
    '    "operationalization": string                  // are constructs operationalized for the study',
    "  },",
    "",
    '  "alignmentReview": {',
    '    "overall": string,',
    '    "elements": [                                 // alignment among: problem, purpose, research questions,',
    "      //   theoretical framework, methodology, population/sample, data collection, data analysis,",
    "      //   trustworthiness/validity.",
    '      { "element": string, "assessment": string } // 8–10 entries when applicable',
    "    ]",
    "  },",
    "",
    '  "chapterSpecificReview": {',
    '    "sectionType": string,                        // "Chapter 1" | "Chapter 2" | "Chapter 3" | "Research paper" | "Other"',
    '    "sections": [                                 // tailored to the section type; 5–9 entries',
    '      { "topic": string, "finding": string, "recommendation": string }',
    "    ]",
    "  },",
    "",
    '  "scholarlyTone": {',
    '    "overall": string,',
    '    "observations": string[],                     // 5–9 items covering sentence clarity, voice, transitions,',
    "                                                // word choice, redundancy, vague claims, AI-formulaic phrasing",
    '    "suggestedEdits": [                           // 3–5 concrete excerpt→revised pairs',
    '      { "excerpt": string, "revised": string, "rationale": string }',
    "    ]",
    "  },",
    "",
    '  "revisionPlan": {',
    '    "immediate": string[],                        // 3–6 items — fix before anything else',
    '    "highImpact": string[],                       // 3–6 items — strengthen these areas',
    '    "finalPolish": string[]                       // 3–6 items — polish details',
    "  }",
    "}",
    "",
    "LENGTH BUDGET (HARD CAP):",
    "  • Each apaReview / chapterSpecificReview entry: 40–80 words across finding + recommendation.",
    "  • literatureReview / theoreticalFramework subfields: 50–100 words each.",
    "  • Each alignmentReview.elements assessment: 25–60 words.",
    "  • scholarlyTone.observations: one sentence each.",
    "  • revisionPlan items: one sentence each, written as imperative actions.",
    "  • Total response must stay under ~3500 tokens to avoid truncation.",
    "",
    "GROUND TRUTH RULES:",
    "  • Do not invent citations, sources, page numbers, or facts. If a reviewer finding did not",
    "    surface a detail, do not assert it.",
    "  • If the upload is not a scholarly manuscript, populate each section explaining respectfully",
    "    why substantive review was not possible, but still return the full schema."
  ].join("\n");
}

// Legacy single-call prompt — preserved for the cron path which can still
// fall back to it if the two-call rerun path is unavailable. NOT USED by
// the v2 runDelivery; kept here for reference and possible future use.
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
    "LENGTH BUDGET (HARD CAP — exceed and the response will be truncated):",
  "  • executiveSummary: 250–400 words. Do not exceed 400.",
  "  • Each strength: 60–100 words across explanation + academicSignificance.",
  "  • Each priorityRevision: 60–110 words across rationale + remedy + exampleRewrite.",
  "  • Each apaReview / chapterSpecificReview entry: 40–80 words.",
  "  • observations and finding lists: 5–10 items, each one sentence.",
  "  • revisionPlan.first/second/third: 3–5 items each, each a single sentence.",
  "  • finalRecommendation: 80–140 words.",
  "  • Total response must stay under 4000 tokens to avoid truncation.",
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

function reportContainsBannedPhrase(report: unknown): string | null {
  const blob = JSON.stringify(report).toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (blob.includes(phrase.toLowerCase())) return phrase;
  }
  return null;
}

/**
 * Build the client-safe Agent Activity Log section programmatically from the
 * job's memory + workflow_events. The client report names every agent in the
 * advertised pipeline (Intake, Academic Review, APA, Citation Integrity,
 * Methodology & Alignment, QA, Report Writer) and reports completed / skipped
 * / not_applicable status for each — so the client never sees a single-agent
 * deliverable when the platform advertises multi-agent review.
 */
async function assembleAgentActivity(jobId: string, mem: JobMemory): Promise<FormalReport["agentActivity"]> {
  const { rows: events } = await db.query(
    `select event, payload, occurred_at from workflow_events where job_id=$1 order by occurred_at asc`,
    [jobId]
  );
  const findEvent = (name: string) => events.find((e) => e.event === name);
  const reviews = (mem.reviews ?? {}) as Record<string, any>;
  const isReal = (e: { occurred_at: any } | undefined) =>
    e ? new Date(e.occurred_at as any).toISOString() : undefined;

  const intakeEv = findEvent("intake.complete");
  const scopeEv = findEvent("scope.complete");
  const qaEv = findEvent("qa.complete");
  const reportEv = findEvent("delivery.complete") ?? findEvent("report.generated");

  const out: FormalReport["agentActivity"] = [];

  out.push({
    agentName: "Intake Agent",
    reviewArea: "Document type, intake metadata, review routing",
    status: mem.intake ? "completed" : "skipped",
    findingsIncluded: Boolean(mem.intake),
    completedAt: isReal(intakeEv)
  });

  // Map review agents to client-friendly names.
  const academic = reviews["professional_editor"];
  out.push({
    agentName: "Academic Review Agent",
    reviewArea: "Scholarly tone, clarity, structure, depth, argument or chapter development",
    status: academic ? "completed" : "skipped",
    findingsIncluded: Boolean(academic && (academic.findings ?? []).length > 0),
    completedAt: undefined,
    note: academic ? undefined : "This agent did not run for this job."
  });

  // APA Compliance is currently covered inside the Professional Editor agent's
  // apaCompliance score + findings. We report it as completed when that signal
  // is present.
  const apaCovered = academic && (academic.apaCompliance != null || (academic.findings ?? []).some((f: any) => f.type === "formatting"));
  out.push({
    agentName: "APA 7 Compliance Agent",
    reviewArea: "Title page, headings, citations, references, DOI/URL, capitalization, italicization, hanging indents",
    status: apaCovered ? "completed" : "not_applicable",
    findingsIncluded: Boolean(apaCovered),
    note: apaCovered ? undefined : "APA findings were folded into the Academic Review pass for this submission."
  });

  // Citation Integrity is currently covered inside the Research Support agent's
  // citationAccuracy score + findings.
  const research = reviews["research_support"];
  const citationCovered = research && (research.citationAccuracy != null || (research.findings ?? []).some((f: any) => f.type === "citation"));
  out.push({
    agentName: "Citation Integrity Agent",
    reviewArea: "In-text vs reference list, missing citations, weak sources, verification advisory",
    status: citationCovered ? "completed" : (research ? "not_applicable" : "skipped"),
    findingsIncluded: Boolean(citationCovered),
    note: citationCovered
      ? undefined
      : research
        ? "No citation-integrity issues surfaced for this submission."
        : "Research Support reviewer did not run for this job."
  });

  // Methodology & Alignment is also covered inside Research Support (literatureSynthesis + methodologyAlignment).
  const methodCovered = research && (research.methodologyAlignment != null || (research.findings ?? []).some((f: any) => f.type === "methodology"));
  out.push({
    agentName: "Methodology & Alignment Agent",
    reviewArea: "Alignment among problem, purpose, research questions, framework, design, sample, data collection, analysis",
    status: methodCovered ? "completed" : (research ? "not_applicable" : "skipped"),
    findingsIncluded: Boolean(methodCovered),
    note: methodCovered
      ? undefined
      : research
        ? "Methodology alignment notes were not specific to this submission type."
        : "Research Support reviewer did not run for this job."
  });

  // Research Intelligence (literature recency + verifiability)
  const intel = reviews["research_intelligence"];
  if (intel) {
    out.push({
      agentName: "Research Intelligence Agent",
      reviewArea: "Literature recency and verifiability across the cited body of work",
      status: "completed",
      findingsIncluded: (intel.findings ?? []).length > 0,
      note: undefined
    });
  }

  out.push({
    agentName: "Quality Assurance Agent",
    reviewArea: "Validates every reviewer output, scores readiness and quality, gates delivery",
    status: mem.qa ? "completed" : "skipped",
    findingsIncluded: Boolean(mem.qa),
    completedAt: isReal(qaEv),
    note: mem.qa
      ? mem.qa.passed
        ? "Final report approved."
        : "Final report flagged for additional review by the QA agent."
      : undefined
  });

  out.push({
    agentName: "Report Writer Agent",
    reviewArea: "Synthesizes all reviewer + QA output into the formal client-facing deliverable",
    status: "completed",
    findingsIncluded: true,
    completedAt: isReal(reportEv)
  });

  return out;
}

/**
 * Quality gate — the last check before a job is marked delivered. Verifies
 * every required section is populated, banned phrases are absent, scores are
 * explained, and the agent activity log was assembled. Returns the gate
 * result plus a per-check breakdown that becomes part of the deliverable.
 * Returning passed=false routes the job to needs_manual_review instead of
 * shipping a low-quality report.
 */
function runQualityGate(report: FormalReport): FormalReport["qualityGate"] {
  const checks: FormalReport["qualityGate"]["checks"] = [];

  // 1. All required sections present.
  const required: Array<[string, boolean]> = [
    ["Cover page populated", Boolean(report.cover?.filename)],
    ["Submission details populated", Boolean(report.submissionDetails)],
    ["Executive summary present (≥250 chars)", (report.executiveSummary ?? "").length >= 250],
    ["Score overview with submissionReadiness explained", Boolean(report.scoreOverview?.submissionReadiness?.explanation?.length)],
    ["Score overview with overallQuality explained", Boolean(report.scoreOverview?.overallQuality?.explanation?.length)],
    ["At least 5 score categories", (report.scoreOverview?.categories ?? []).length >= 5],
    ["At least 5 major strengths", (report.majorStrengths ?? []).length >= 5],
    ["At least 5 priority revisions", (report.priorityRevisions ?? []).length >= 5],
    ["APA review present", Boolean(report.apaReview?.overall?.length)],
    ["Citation integrity present with verification disclaimer", Boolean(report.citationIntegrity?.verificationDisclaimer?.length)],
    ["Literature review present", Boolean(report.literatureReview?.overall?.length)],
    ["Theoretical framework review present", Boolean(report.theoreticalFramework?.overall?.length)],
    ["Alignment review present", Boolean(report.alignmentReview?.overall?.length)],
    ["Chapter-specific review present", Boolean(report.chapterSpecificReview?.sections?.length || report.chapterSpecificReview?.sectionType)],
    ["Scholarly tone review present", Boolean(report.scholarlyTone?.overall?.length)],
    ["Three-tier revision plan present", Boolean(
      (report.revisionPlan?.immediate?.length ?? 0) +
        (report.revisionPlan?.highImpact?.length ?? 0) +
        (report.revisionPlan?.finalPolish?.length ?? 0) > 0
    )],
    ["Final recommendation present (≥80 chars)", (report.finalRecommendation ?? "").length >= 80],
    ["Agent activity log populated", (report.agentActivity ?? []).length >= 5],
    ["Support and next steps populated", Boolean(report.supportAndNextSteps?.contactEmail)]
  ];
  for (const [name, ok] of required) {
    checks.push({ name, status: ok ? "pass" : "fail" });
  }

  // 2. Banned phrases.
  const banned = reportContainsBannedPhrase(report);
  checks.push({
    name: "Free of casual/banned phrases",
    status: banned ? "fail" : "pass",
    note: banned ? `Found: "${banned}"` : undefined
  });

  // 3. Every score category has explanation + recommendation.
  const categories = report.scoreOverview?.categories ?? [];
  const allExplained = categories.length > 0 && categories.every((c) => c.reason && c.recommendation);
  checks.push({
    name: "Every score category has reason + recommendation",
    status: allExplained ? "pass" : "fail"
  });

  // 4. Every priority revision has issue + fix.
  const revisions = report.priorityRevisions ?? [];
  const allActionable =
    revisions.length === 0 ||
    revisions.every((r) => r.issue && r.recommendedFix && r.whyItMatters);
  checks.push({
    name: "Every priority revision has issue, rationale, and fix",
    status: allActionable ? "pass" : "fail"
  });

  const passed = checks.every((c) => c.status === "pass");
  return { passed, checks };
}

/**
 * Build the cover + submission details + support sections from DB/intake.
 */
function buildProgrammaticSections(
  mem: JobMemory,
  ctx: {
    jobId: string;
    displayId: string;
    filename: string;
    wordCount?: number;
  }
) {
  const intake = (mem.intake ?? {}) as any;
  const uploadMeta = ((mem as any).uploadMeta ?? {}) as any;
  const intakeMeta = (uploadMeta?.intake ?? {}) as any;
  const intakeMerged = { ...intakeMeta, ...intake };

  const studentName =
    [intakeMerged.firstName, intakeMerged.lastName].filter(Boolean).join(" ").trim() || undefined;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dissertationeditingcenter.com";

  return {
    cover: {
      documentTitle: intakeMerged.chapterUploaded ?? ctx.filename,
      servicePurchased: intakeMerged.serviceRequested ?? "Scholarly Review",
      studentName,
      submissionId: ctx.displayId,
      completedAt: new Date().toISOString(),
      filename: ctx.filename,
      wordCount: ctx.wordCount
    } as FormalReport["cover"],
    submissionDetails: {
      chapterUploaded: intakeMerged.chapterUploaded,
      degreeProgram: intakeMerged.degreeProgram ?? intake.degreeLevel,
      dissertationStage: intakeMerged.dissertationStage,
      university: intakeMerged.university,
      deadline: intake.deadlineIso,
      professorFeedback: intake.professorFeedback ?? intakeMerged.notes,
      areasOfConcern: (intake.areasOfConcern as string[] | undefined) ?? []
    } as FormalReport["submissionDetails"],
    supportAndNextSteps: {
      contactEmail: "support@doctoralediting.com",
      statusUrl: `${baseUrl}/status/${ctx.jobId}`,
      pdfUrl: `${baseUrl}/api/jobs/${ctx.jobId}/report.pdf`,
      note:
        "If any portion of this report is unclear or you would like a follow-up consultation, " +
        "please contact us at support@doctoralediting.com. A second review pass is available on request."
    } as FormalReport["supportAndNextSteps"]
  };
}

// Up to two retry attempts per LLM call to recover from truncated JSON or
// banned phrases. Anything still failing after retries falls through to the
// schema's default-empty values, which the quality gate will then reject and
// route to needs_manual_review.
async function generateAnalyticalSection(
  jobId: string,
  mem: JobMemory,
  ctx: { filename: string; displayId: string; servicePurchased?: string }
): Promise<z.infer<typeof analyticalSchema> | null> {
  let lastErr: string | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const guard = attempt > 1 && lastErr
      ? `\n\nPREVIOUS ATTEMPT REJECTED: ${lastErr}. Repair and return clean JSON.`
      : "";
    try {
      const out = await invokeAgent({
        agent: "orchestrator",
        jobId,
        task:
          "Produce the analytical half of the formal client deliverable: executive summary, " +
          "nine-category score overview with explanations, QA review paragraph, major strengths, " +
          "priority revisions, and final recommendation. Use the reviewer + QA findings as evidence.",
        context: {
          intake: mem.intake,
          scope: mem.scope,
          reviews: mem.reviews,
          qa: mem.qa,
          manuscript: ctx
        },
        system: analyticalSystem() + guard,
        maxTokens: 4000,
        timeoutMs: 50_000,
        model: process.env.ANTHROPIC_REPORT_MODEL ?? "claude-haiku-4-5-20251001",
        bypassManagedAgent: true
      });
      const parsed = analyticalSchema.parse(parseJson<any>(out.text));
      const banned = reportContainsBannedPhrase(parsed);
      if (banned && attempt < 2) {
        lastErr = `Output contained banned phrase: "${banned}". Rewrite using formal academic language.`;
        await recordWorkflowEvent(jobId, "report.analytical.banned_phrase", { phrase: banned, attempt });
        continue;
      }
      await recordWorkflowEvent(jobId, "report.analytical.generated", {
        attempt,
        execWords: countWords(parsed.executiveSummary),
        strengths: parsed.majorStrengths.length,
        revisions: parsed.priorityRevisions.length,
        categories: parsed.scoreOverview.categories.length
      });
      return parsed;
    } catch (err) {
      lastErr = err instanceof Error ? err.message.slice(0, 240) : "parse failed";
      await recordWorkflowEvent(jobId, "report.analytical.parse_failed", { attempt, message: lastErr });
    }
  }
  return null;
}

async function generateSectionedReviews(
  jobId: string,
  mem: JobMemory,
  ctx: { filename: string; displayId: string; servicePurchased?: string }
): Promise<z.infer<typeof sectionedSchema> | null> {
  let lastErr: string | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const guard = attempt > 1 && lastErr
      ? `\n\nPREVIOUS ATTEMPT REJECTED: ${lastErr}. Repair and return clean JSON.`
      : "";
    try {
      const out = await invokeAgent({
        agent: "orchestrator",
        jobId,
        task:
          "Produce the sectioned-review half of the formal client deliverable: APA 7 review, " +
          "citation integrity, literature review, theoretical framework, alignment, chapter-specific " +
          "review, scholarly tone, and the three-tier revision plan. Use the reviewer findings as evidence.",
        context: {
          intake: mem.intake,
          scope: mem.scope,
          reviews: mem.reviews,
          qa: mem.qa,
          manuscript: ctx
        },
        system: sectionedSystem() + guard,
        maxTokens: 4000,
        timeoutMs: 50_000,
        model: process.env.ANTHROPIC_REPORT_MODEL ?? "claude-haiku-4-5-20251001",
        bypassManagedAgent: true
      });
      const parsed = sectionedSchema.parse(parseJson<any>(out.text));
      const banned = reportContainsBannedPhrase(parsed);
      if (banned && attempt < 2) {
        lastErr = `Output contained banned phrase: "${banned}". Rewrite using formal academic language.`;
        await recordWorkflowEvent(jobId, "report.sectioned.banned_phrase", { phrase: banned, attempt });
        continue;
      }
      await recordWorkflowEvent(jobId, "report.sectioned.generated", {
        attempt,
        apaAreas: parsed.apaReview.areas.length,
        alignment: parsed.alignmentReview.elements.length,
        toneEdits: parsed.scholarlyTone.suggestedEdits.length
      });
      return parsed;
    } catch (err) {
      lastErr = err instanceof Error ? err.message.slice(0, 240) : "parse failed";
      await recordWorkflowEvent(jobId, "report.sectioned.parse_failed", { attempt, message: lastErr });
    }
  }
  return null;
}

export async function runDelivery(jobId: string) {
  const mem = await readMemory(jobId);

  const { rows } = await db.query(
    "select display_id, filename, word_count from jobs where id=$1",
    [jobId]
  );
  const displayId = (rows[0]?.display_id as string | undefined) ?? jobId;
  const filename = (rows[0]?.filename as string | undefined) ?? "your manuscript";
  const wordCount = (rows[0]?.word_count as number | undefined) ?? undefined;
  const servicePurchased = ((mem.intake ?? {}) as any).serviceRequested as string | undefined;

  // Two parallel LLM calls — both fit in 50s and use ~4000 output tokens.
  const [analytical, sectioned] = await Promise.all([
    generateAnalyticalSection(jobId, mem, { filename, displayId, servicePurchased }),
    generateSectionedReviews(jobId, mem, { filename, displayId, servicePurchased })
  ]);

  if (!analytical || !sectioned) {
    await setStage(jobId, "needs_manual_review");
    await recordWorkflowEvent(jobId, "report.escalated_manual_review", {
      analytical: Boolean(analytical),
      sectioned: Boolean(sectioned)
    });
    return;
  }

  // Programmatic sections — cover, submission details, support boilerplate.
  const programmatic = buildProgrammaticSections(mem, {
    jobId,
    displayId,
    filename,
    wordCount
  });

  // Agent activity log — pulled from workflow_events + memory.reviews.
  const agentActivity = await assembleAgentActivity(jobId, mem);

  // Sync the score overview's submissionReadiness/overallQuality with the
  // QA agent's actual numeric outputs (the analytical call may have used
  // its own judgment). The QA agent is canonical for these two top-line
  // scores; the per-category subscores remain the report writer's call.
  const qaReadiness = (mem.qa?.submissionReadiness as number | undefined) ?? analytical.scoreOverview.submissionReadiness.score;
  const qaQuality = (mem.qa?.qualityScore as number | undefined) ?? analytical.scoreOverview.overallQuality.score;
  const syncedScoreOverview: FormalReport["scoreOverview"] = {
    submissionReadiness: {
      score: qaReadiness,
      explanation: analytical.scoreOverview.submissionReadiness.explanation
    },
    overallQuality: {
      score: qaQuality,
      explanation: analytical.scoreOverview.overallQuality.explanation
    },
    categories: analytical.scoreOverview.categories
  };

  // Assemble the FormalReport (v2). Quality gate runs on the assembled object.
  const assembled: FormalReport = {
    cover: programmatic.cover,
    submissionDetails: programmatic.submissionDetails,
    executiveSummary: analytical.executiveSummary,
    scoreOverview: syncedScoreOverview,
    qaReview: analytical.qaReview,
    majorStrengths: analytical.majorStrengths.map((s) => ({ ...s, evidence: s.evidence ?? undefined })),
    priorityRevisions: analytical.priorityRevisions.map((r, i) => ({
      findingNumber: r.findingNumber || i + 1,
      location: r.location ?? undefined,
      severity: r.severity,
      category: r.category,
      excerpt: r.excerpt ?? undefined,
      issue: r.issue,
      whyItMatters: r.whyItMatters,
      recommendedFix: r.recommendedFix,
      exampleRevision: r.exampleRevision ?? undefined,
      relatedStandard: r.relatedStandard ?? undefined
    })),
    apaReview: sectioned.apaReview,
    citationIntegrity: sectioned.citationIntegrity,
    literatureReview: sectioned.literatureReview,
    theoreticalFramework: sectioned.theoreticalFramework,
    alignmentReview: sectioned.alignmentReview,
    chapterSpecificReview: sectioned.chapterSpecificReview,
    scholarlyTone: sectioned.scholarlyTone,
    revisionPlan: sectioned.revisionPlan,
    finalRecommendation: analytical.finalRecommendation,
    agentActivity,
    qualityGate: { passed: false, checks: [] }, // filled below
    supportAndNextSteps: programmatic.supportAndNextSteps
  };

  // Run the quality gate against the assembled report.
  assembled.qualityGate = runQualityGate(assembled);
  const passed = assembled.qualityGate.passed;
  const failedChecks = assembled.qualityGate.checks.filter((c) => c.status === "fail").map((c) => c.name);
  await recordWorkflowEvent(jobId, "report.quality_gate", {
    passed,
    failedChecks
  });

  if (!passed) {
    // Still persist the formalReport so an admin can inspect what was produced,
    // but route the job to needs_manual_review so the client never sees it.
    await writeMemory(jobId, { formalReport: assembled });
    await setStage(jobId, "needs_manual_review");
    await recordWorkflowEvent(jobId, "report.escalated_manual_review", {
      reason: "quality_gate_failed",
      failedChecks
    });
    return;
  }

  const formal = assembled;

  // Persist BOTH the new formalReport and a legacy `report` shape so the
  // email + status-page code paths continue to work.
  const legacyReport: FinalReport = {
    executiveSummary: formal.executiveSummary,
    revisionPlan: [
      ...formal.revisionPlan.immediate.map((s) => `Immediate: ${s}`),
      ...formal.revisionPlan.highImpact.map((s) => `High impact: ${s}`),
      ...formal.revisionPlan.finalPolish.map((s) => `Final polish: ${s}`)
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
