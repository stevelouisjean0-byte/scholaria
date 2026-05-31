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
 * Executive-level client deliverable v2 — 18-section formal report.
 *
 * Structure maps 1:1 to the PDF the client receives. Produced by two
 * sequential LLM calls plus programmatic assembly:
 *
 *   Call A (analytical):  executiveSummary, scoreOverview, qaReview,
 *                         majorStrengths, priorityRevisions, finalRecommendation
 *   Call B (sectioned):   apaReview, citationIntegrity, literatureReview,
 *                         theoreticalFramework, alignmentReview,
 *                         chapterSpecificReview, scholarlyTone, revisionPlan
 *   Programmatic:         cover, submissionDetails, agentActivity,
 *                         qualityGate, supportAndNextSteps
 *
 * The qualityGate.passed flag MUST be true for a job to be marked delivered;
 * otherwise the job is routed to needs_manual_review.
 */
export interface FormalReport {
  /** Cover-page metadata. Filled programmatically from DB + intake. */
  cover: {
    documentTitle?: string;
    servicePurchased?: string;
    studentName?: string;
    submissionId: string;
    completedAt: string;
    filename: string;
    wordCount?: number;
  };

  /** Submission details from intake. Filled programmatically. */
  submissionDetails: {
    chapterUploaded?: string;
    degreeProgram?: string;
    dissertationStage?: string;
    university?: string;
    deadline?: string;
    professorFeedback?: string;
    areasOfConcern?: string[];
  };

  /** 300–500 words. Formal academic register. */
  executiveSummary: string;

  /** Score Overview with the canonical 9 categories. */
  scoreOverview: {
    submissionReadiness: { score: number; explanation: string };
    overallQuality: { score: number; explanation: string };
    categories: Array<{
      name: string; // e.g. "Scholarly Tone", "APA 7 Compliance"
      score: number; // 0–100
      reason: string;
      evidence?: string;
      recommendation: string;
    }>;
  };

  /** Paragraph-form QA review explanation. */
  qaReview: string;

  /** At least five document-specific strengths. */
  majorStrengths: Array<{
    heading: string;
    explanation: string;
    evidence?: string;
    academicSignificance: string;
  }>;

  /** At least five prioritized revisions with rich per-finding metadata. */
  priorityRevisions: Array<{
    findingNumber: number;
    location?: string;
    severity: "high" | "moderate" | "minor";
    category: string;
    excerpt?: string;
    issue: string;
    whyItMatters: string;
    recommendedFix: string;
    exampleRevision?: string;
    relatedStandard?: string;
  }>;

  apaReview: {
    overall: string;
    areas: Array<{ area: string; status: string; finding: string; recommendation: string }>;
  };

  citationIntegrity: {
    overall: string;
    verificationDisclaimer: string;
    requiresVerification: string[];
    missingFromReferences: string[];
    uncitedInBody: string[];
    notes: string;
  };

  literatureReview: {
    overall: string;
    organization: string;
    synthesis: string;
    themes: string;
    gapArticulation: string;
  };

  theoreticalFramework: {
    overall: string;
    frameworkIdentified?: string;
    integration: string;
    operationalization: string;
  };

  alignmentReview: {
    overall: string;
    elements: Array<{ element: string; assessment: string }>;
  };

  chapterSpecificReview: {
    sectionType: string;
    sections: Array<{ topic: string; finding: string; recommendation: string }>;
  };

  scholarlyTone: {
    overall: string;
    observations: string[];
    suggestedEdits: Array<{ excerpt: string; revised: string; rationale: string }>;
  };

  revisionPlan: {
    immediate: string[];
    highImpact: string[];
    finalPolish: string[];
  };

  finalRecommendation: string;

  /** Client-safe agent activity log. Filled programmatically from
   *  workflow_events + memory.reviews. */
  agentActivity: Array<{
    agentName: string;
    reviewArea: string;
    status: "completed" | "skipped" | "not_applicable";
    findingsIncluded: boolean;
    completedAt?: string;
    note?: string;
  }>;

  /** Quality gate result. Filled by the QA validator after generation. */
  qualityGate: {
    passed: boolean;
    checks: Array<{ name: string; status: "pass" | "fail"; note?: string }>;
  };

  supportAndNextSteps: {
    contactEmail: string;
    statusUrl: string;
    pdfUrl: string;
    note: string;
  };
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
