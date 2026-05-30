/**
 * Shared workflow memory.
 *
 * Every job carries a single memory document that all reviewing agents read
 * and write to. The Orchestrator merges agent outputs into this document so
 * that downstream agents see the same picture without re-deriving facts.
 */
import { db } from "./db";

export interface JobMemory {
  jobId: string;
  intake?: IntakeSnapshot;
  scope?: ScopeSnapshot;
  reviews: Partial<Record<string, AgentReview>>;
  qa?: QASnapshot;
  /** Legacy. Newly delivered jobs populate `formalReport` instead. */
  report?: FinalReport;
  /** Executive-level deliverable. Populated by runDelivery for all new jobs. */
  formalReport?: FormalReport;
  updatedAt: string;
}

export interface IntakeSnapshot {
  degreeLevel: string;
  assignmentType: string;
  deadlineIso: string | null;
  formattingStyle: "APA7" | "APA6" | "MLA" | "Chicago" | "Other";
  professorFeedback: string;
  areasOfConcern: string[];
}

export interface ScopeSnapshot {
  complexity: "standard" | "advanced" | "intensive";
  category: string;
  servicePackage: string;
  priority: "normal" | "rush" | "critical";
  assignedAgents: string[];
}

export interface AgentReview {
  agentKey: string;
  scholarlyTone: number;
  clarity: number;
  apaCompliance?: number;
  literatureSynthesis?: number;
  methodologyAlignment?: number;
  citationAccuracy?: number;
  findings: ReviewFinding[];
  summary: string;
}

export interface ReviewFinding {
  id: string;
  page?: number;
  section?: string;
  excerpt: string;
  issue: string;
  recommendation: string;
  severity: "minor" | "moderate" | "major";
  type: "tone" | "clarity" | "formatting" | "citation" | "synthesis" | "methodology" | "structure";
}

export interface QASnapshot {
  passed: boolean;
  submissionReadiness: number;
  qualityScore: number;
  notes: string;
}

/**
 * Legacy shape — preserved for backward compatibility with already-delivered
 * jobs whose memory predates the formal 12-section deliverable. New jobs use
 * FormalReport (below); the PDF renderer falls back to FinalReport when only
 * the legacy field is present.
 */
export interface FinalReport {
  executiveSummary: string;
  revisionPlan: string[];
  deliverables: { label: string; url: string; kind: string }[];
}

/**
 * Executive-level client deliverable. Every delivered job produces a
 * FormalReport that maps 1:1 to the 12 required sections of the client-
 * facing PDF: cover, executive summary, score explanations, strengths,
 * priority revisions, APA review, citation integrity, scholarly tone,
 * alignment, chapter-specific, revision plan, and final recommendation.
 *
 * Schema is intentionally strict: optional fields use empty arrays /
 * empty strings so the renderer can always assume a shape. Validation
 * happens at the orchestrator boundary via formalReportSchema.
 */
export interface FormalReport {
  /** Cover-page metadata. Populated by the orchestrator from DB facts. */
  cover: {
    documentTitle?: string;
    servicePurchased?: string;
    completedAt: string;
  };
  /** 250–400 words. Formal academic register. Replaces the legacy field. */
  executiveSummary: string;
  /** Paragraph-form rationale for the readiness and quality scores. */
  scoreExplanations: {
    readiness: string;
    quality: string;
  };
  /** At least five document-specific strengths. */
  strengths: Array<{
    heading: string;
    explanation: string;
    evidence?: string;
    academicSignificance: string;
  }>;
  /** At least five prioritized revisions with concrete remedies. */
  priorityRevisions: Array<{
    issue: string;
    rationale: string;
    location?: string;
    remedy: string;
    exampleRewrite?: string;
  }>;
  apaReview: {
    overall: string;
    findings: Array<{ area: string; finding: string; recommendation: string }>;
  };
  citationIntegrity: {
    overall: string;
    missingReferences: string[];
    uncitedReferences: string[];
    weakOrOutdatedSources: string[];
    notes: string;
  };
  scholarlyTone: {
    overall: string;
    observations: string[];
    suggestedEdits: Array<{ excerpt: string; revised: string; rationale: string }>;
  };
  alignmentReview: {
    overall: string;
    elements: Array<{ element: string; assessment: string }>;
  };
  chapterSpecificReview: {
    sectionType: string;
    sections: Array<{ topic: string; finding: string; recommendation: string }>;
  };
  revisionPlan: {
    first: string[];
    second: string[];
    third: string[];
  };
  finalRecommendation: string;
}

export async function readMemory(jobId: string): Promise<JobMemory> {
  const { rows } = await db.query("select memory from jobs where id=$1", [jobId]);
  if (!rows.length) {
    return { jobId, reviews: {}, updatedAt: new Date().toISOString() };
  }
  return (rows[0].memory as JobMemory) ?? { jobId, reviews: {}, updatedAt: new Date().toISOString() };
}

export async function writeMemory(jobId: string, patch: Partial<JobMemory>) {
  const current = await readMemory(jobId);
  const merged: JobMemory = {
    ...current,
    ...patch,
    reviews: { ...current.reviews, ...(patch.reviews ?? {}) },
    updatedAt: new Date().toISOString()
  };
  await db.query("update jobs set memory=$2, updated_at=now() where id=$1", [jobId, merged]);
  return merged;
}
