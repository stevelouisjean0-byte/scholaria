# Agent Reference

Ten specialised Claude Managed Agents, organised by tier. Every agent's runtime ID is loaded from an environment variable; the registry in `lib/agents.ts` is the single source of truth.

## Core orchestration

### Lead Intake Agent · `lead_intake`
**Env:** `AGENT_LEAD_INTAKE`
Captures degree level, assignment type, deadline, formatting style, professor feedback, and stated concerns the moment a manuscript is received.

### Project Scoping & Routing Agent · `project_scoping`
**Env:** `AGENT_PROJECT_SCOPING`
Scores academic complexity, classifies the paper, assigns the service package, and selects the precise review path and priority tier.

### Orchestrator Agent · `orchestrator`
**Env:** `AGENT_ORCHESTRATOR`
Coordinates every reviewing agent, maintains the shared memory document, drives state transitions, and assembles the final scholarly package.

## Scholarly review

### Professional Editor Agent · `professional_editor`
**Env:** `AGENT_PROFESSIONAL_EDITOR`
Grammar, scholarly tone, sentence restructuring, clarity, human-like academic writing enhancement, and AI-pattern reduction.

### Research Support Agent · `research_support`
**Env:** `AGENT_RESEARCH_SUPPORT`
Literature review, citation review, research synthesis, gap identification, thematic organisation, and scholarly depth evaluation.

### QA & Final Approval Agent · `qa_final`
**Env (primary):** `AGENT_QA_FINAL_PRIMARY`
**Env (backup):** `AGENT_QA_FINAL_BACKUP`
Final quality assurance, formatting consistency, submission readiness scoring, report validation, autonomous final approval.

## Operations

### Pricing & Payment Agent · `pricing_payment`
**Env (primary):** `AGENT_PRICING_PAYMENT_PRIMARY`
**Env (backup):** `AGENT_PRICING_PAYMENT_BACKUP`
Owns the Stripe-backed billing lifecycle: subscriptions, invoices, upgrades, and dunning.

### Client Support Agent · `client_support`
**Env:** `AGENT_CLIENT_SUPPORT`
Autonomous support chat, ticket handling, revision guidance, knowledge-base automation.

### Survey Completion Bot · `survey_completion`
**Env:** `AGENT_SURVEY_COMPLETION`
Post-delivery feedback, CSAT, retention analytics.

## Growth

### SEO & Growth Optimization Agent · `seo_growth`
**Env:** `AGENT_SEO_GROWTH`
Organic search, blog generation, LLM discoverability across ChatGPT, Gemini, Perplexity, and Claude; content strategy.

---

## Calling convention

Every agent is invoked through `invokeAgent()` in `lib/claude.ts`:

```ts
const out = await invokeAgent({
  agent: "professional_editor",
  jobId,
  task: "...task text...",
  context: { /* shared workflow facts */ },
  system: "...optional structured-output instructions..."
});
```

The wrapper:

- Resolves the runtime Managed Agent ID from env (primary → backup → fail).
- Injects a system prompt that enforces the writing rules (no AI-generated patterns, explicit/scholarly register, no full replacement prose).
- Passes the Managed Agent ID via the `anthropic-managed-agent` header so the Console-managed tools and guardrails take precedence.
- Records token usage, latency, and cache-read counts in `agent_invocations`.

## Backup IDs

Pricing & Payment and QA & Final Approval are the two agents where a stuck call would block the platform from billing or releasing work. They are the only two configured with both primary and backup IDs; `resolveAgentId()` will use the backup automatically when the primary is missing.
