/**
 * Scholaria — Claude Managed Agent Registry
 *
 * Every agent is referenced by a typed key. Full Managed Agent IDs are loaded
 * exclusively from environment variables so they are never present in the
 * repository or shipped to the client. The registry is the single source of
 * truth for agent identity, role, and routing metadata.
 */

export type AgentKey =
  | "lead_intake"
  | "project_scoping"
  | "orchestrator"
  | "professional_editor"
  | "research_support"
  | "pricing_payment"
  | "qa_final"
  | "client_support"
  | "seo_growth"
  | "survey_completion";

export type AgentTier = "core" | "review" | "operations" | "growth";

export interface AgentDefinition {
  key: AgentKey;
  name: string;
  tier: AgentTier;
  envPrimary: string;
  envBackup?: string;
  role: string;
  responsibilities: string[];
  defaultModel?: string;
  publicSummary: string;
}

const REGISTRY: Record<AgentKey, AgentDefinition> = {
  lead_intake: {
    key: "lead_intake",
    name: "Lead Intake Agent",
    tier: "core",
    envPrimary: "AGENT_LEAD_INTAKE",
    role: "Student onboarding and intake automation.",
    responsibilities: [
      "Student onboarding",
      "Requirement gathering",
      "Intake automation",
      "Deadline tracking",
      "File initialization"
    ],
    publicSummary:
      "Captures degree level, paper type, deadline, formatting style, professor feedback, and stated concerns the moment a document is uploaded."
  },
  project_scoping: {
    key: "project_scoping",
    name: "Project Scoping & Routing Agent",
    tier: "core",
    envPrimary: "AGENT_PROJECT_SCOPING",
    role: "Complexity scoring and workflow routing.",
    responsibilities: [
      "Complexity scoring",
      "Project categorization",
      "Workflow routing",
      "Service assignment",
      "Priority mapping"
    ],
    publicSummary:
      "Determines academic complexity, paper category, service package, and the precise review path each manuscript should travel."
  },
  orchestrator: {
    key: "orchestrator",
    name: "Orchestrator Agent",
    tier: "core",
    envPrimary: "AGENT_ORCHESTRATOR",
    role: "Central workflow orchestration and autonomous execution control.",
    responsibilities: [
      "Central workflow orchestration",
      "Shared memory coordination",
      "Agent communication",
      "Task assignment",
      "State management",
      "Trigger automation",
      "Autonomous execution control"
    ],
    publicSummary:
      "Coordinates every reviewing agent through shared memory, workflow state, and event triggers — operating the platform without human intervention."
  },
  professional_editor: {
    key: "professional_editor",
    name: "Professional Editor Agent",
    tier: "review",
    envPrimary: "AGENT_PROFESSIONAL_EDITOR",
    role: "Scholarly editing, tone refinement, and human-like writing enhancement.",
    responsibilities: [
      "Grammar correction",
      "Scholarly tone refinement",
      "Sentence restructuring",
      "Clarity optimization",
      "Human-like academic writing enhancement",
      "AI-writing pattern reduction"
    ],
    publicSummary:
      "Refines scholarly tone, clarity, and cadence — producing edits that read as a thoughtful human reviewer would write them."
  },
  research_support: {
    key: "research_support",
    name: "Research Support Agent",
    tier: "review",
    envPrimary: "AGENT_RESEARCH_SUPPORT",
    role: "Literature review, citation review, and research synthesis analysis.",
    responsibilities: [
      "Literature review analysis",
      "Citation review",
      "Research synthesis",
      "Gap identification",
      "Theme organization",
      "Scholarly depth evaluation"
    ],
    publicSummary:
      "Evaluates the depth, synthesis, and thematic coherence of literature reviews and flags gaps in the scholarly conversation."
  },
  pricing_payment: {
    key: "pricing_payment",
    name: "Pricing & Payment Agent",
    tier: "operations",
    envPrimary: "AGENT_PRICING_PAYMENT_PRIMARY",
    envBackup: "AGENT_PRICING_PAYMENT_BACKUP",
    role: "Billing, subscription, and Stripe automation.",
    responsibilities: [
      "Stripe billing automation",
      "Subscription management",
      "Invoice generation",
      "Payment processing",
      "Upgrade workflows"
    ],
    publicSummary:
      "Owns the entire Stripe-backed billing lifecycle — subscriptions, invoices, upgrades, and dunning — without manual reconciliation."
  },
  qa_final: {
    key: "qa_final",
    name: "QA & Final Approval Agent",
    tier: "review",
    envPrimary: "AGENT_QA_FINAL_PRIMARY",
    envBackup: "AGENT_QA_FINAL_BACKUP",
    role: "Final quality assurance and submission readiness scoring.",
    responsibilities: [
      "Final quality assurance",
      "Formatting consistency",
      "Submission readiness scoring",
      "Report validation",
      "Autonomous final approval"
    ],
    publicSummary:
      "Audits every deliverable for formatting consistency, scholarly tone, and submission readiness before autonomous release."
  },
  client_support: {
    key: "client_support",
    name: "Client Support Agent",
    tier: "operations",
    envPrimary: "AGENT_CLIENT_SUPPORT",
    role: "Autonomous student support, tickets, and revision guidance.",
    responsibilities: [
      "Autonomous support chat",
      "Ticket handling",
      "User communication",
      "Revision guidance",
      "Knowledge base automation"
    ],
    publicSummary:
      "Handles every student question — onboarding, status, revisions, and account — in a calm, scholarly voice, around the clock."
  },
  seo_growth: {
    key: "seo_growth",
    name: "SEO & Growth Optimization Agent",
    tier: "growth",
    envPrimary: "AGENT_SEO_GROWTH",
    role: "Organic search, LLM discoverability, and content strategy.",
    responsibilities: [
      "SEO optimization",
      "Blog generation",
      "Organic search growth",
      "LLM discoverability optimization",
      "Search visibility",
      "Content strategy",
      "AI-search optimization for ChatGPT and Gemini"
    ],
    publicSummary:
      "Continuously expands organic and AI-search visibility across Google, ChatGPT, and Gemini surfaces."
  },
  survey_completion: {
    key: "survey_completion",
    name: "Survey Completion Bot",
    tier: "operations",
    envPrimary: "AGENT_SURVEY_COMPLETION",
    role: "Feedback collection and retention analytics.",
    responsibilities: [
      "User feedback collection",
      "Satisfaction scoring",
      "Retention analytics",
      "Experience tracking"
    ],
    publicSummary:
      "Closes the loop after every deliverable — collecting structured satisfaction data that feeds retention models."
  }
};

export function getAgent(key: AgentKey): AgentDefinition {
  const def = REGISTRY[key];
  if (!def) throw new Error(`Unknown agent key: ${key}`);
  return def;
}

export function listAgents(): AgentDefinition[] {
  return Object.values(REGISTRY);
}

export function publicAgents() {
  return listAgents().map(({ key, name, tier, role, responsibilities, publicSummary }) => ({
    key,
    name,
    tier,
    role,
    responsibilities,
    publicSummary
  }));
}

/**
 * Resolves the runtime Managed Agent ID for a given key. Falls back to backup
 * if primary is missing. Throws if neither is configured — fail loud, never
 * silently route to the wrong agent.
 */
export function resolveAgentId(key: AgentKey): string {
  const def = getAgent(key);
  const primary = process.env[def.envPrimary];
  if (primary && primary.length > 0 && !primary.startsWith("agent_...")) return primary;
  if (def.envBackup) {
    const backup = process.env[def.envBackup];
    if (backup && backup.length > 0 && !backup.startsWith("agent_...")) return backup;
  }
  throw new Error(
    `Managed Agent ID not configured for ${def.name} (expected env ${def.envPrimary}${def.envBackup ? " or " + def.envBackup : ""}).`
  );
}

export function agentsByTier(tier: AgentTier): AgentDefinition[] {
  return listAgents().filter((a) => a.tier === tier);
}
