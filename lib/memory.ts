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
  report?: FinalReport;
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

export interface FinalReport {
  executiveSummary: string;
  revisionPlan: string[];
  deliverables: { label: string; url: string; kind: string }[];
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
