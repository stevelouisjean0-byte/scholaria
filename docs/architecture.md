# Scholaria — Architecture

The platform is engineered around three commitments:

1. **Zero human intervention** in the review pipeline.
2. **One coordinated ecosystem of agents**, not isolated prompts.
3. **Quality assurance gates every output** before a student ever sees it.

## High-level flow

```
   ┌────────────────────────────────────────────────────────────────────┐
   │                          Next.js (Vercel)                         │
   │                                                                    │
   │  Pages          Route handlers (/api)                              │
   │   ├─ home       ├─ upload      → enqueue intake                    │
   │   ├─ services   ├─ intake      → enqueue intake                    │
   │   ├─ pricing    ├─ orchestrate → enqueue intake                    │
   │   ├─ dashboard  ├─ jobs/[id]   → durable state                     │
   │   ├─ admin      ├─ support     → invokes Client Support agent      │
   │   └─ SEO pages  └─ webhooks/stripe → durable billing ledger        │
   └─────────────┬─────────────────────────────────────────────────────┘
                 │
                 ▼  BullMQ on Redis
   ┌────────────────────────────────────────────────────────────────────┐
   │                       Background workers                          │
   │                                                                    │
   │  intake → scope → fanout(reviews) → qa → delivery → notify         │
   │       (lib/orchestrator.ts state machine)                         │
   └─────────────┬─────────────────────────────────────────────────────┘
                 │
                 ▼  Anthropic SDK (lib/claude.ts)
   ┌────────────────────────────────────────────────────────────────────┐
   │                Claude Managed Agents (10 agents)                  │
   │                                                                    │
   │  Lead Intake · Project Scoping & Routing · Orchestrator           │
   │  Professional Editor · Research Support                            │
   │  Pricing & Payment (primary/backup)                                │
   │  QA & Final Approval (primary/backup)                              │
   │  Client Support · SEO & Growth · Survey Completion                 │
   └────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │                Postgres (jobs · memory · events · findings)       │
   └────────────────────────────────────────────────────────────────────┘
```

## Shared memory

Every job has a single `jobs.memory` JSONB document. Reviewing agents read this document and append their `AgentReview` to `memory.reviews[agent_key]`. The QA agent reads the full document and decides whether to release. The Orchestrator assembles `memory.report` for delivery.

This means agents are **not isolated prompts**: downstream agents see what upstream agents already established without re-deriving.

## State machine

```
uploaded
  → intake          Lead Intake Agent captures intake snapshot
  → scoping         Project Scoping & Routing classifies and routes
  → reviewing       Reviewing agents fan out in parallel
  → qa              QA & Final Approval validates outputs
  → delivering      Orchestrator assembles the final scholarly package
  → delivered       Client Support Agent notifies the student
```

Recovery: if QA marks `passed=false`, the orchestrator requeues the weakest review based on QA notes. Each step is independently retryable with exponential backoff at the queue level.

## Security & integrity

- **Secrets** — every Managed Agent ID is loaded from env vars exclusively. The registry fails loudly if an ID is missing rather than silently routing to the wrong agent.
- **Uploads** — encrypted in transit and at rest. Retention is plan-controlled; enterprise customers configure retention per program.
- **Integrity** — agents never produce full replacement prose for entire sections; the QA agent rejects any output that reads as generic, robotic, or AI-generated.
- **Audit** — every agent invocation, finding, and workflow event is durable in Postgres.

## SEO

- Each major service vertical has a dedicated SEO landing page with unique copy, FAQ JSON-LD, and a clear conversion path.
- `robots.ts` explicitly allows GPTBot, Google-Extended, PerplexityBot, and ClaudeBot — enabling LLM discoverability across ChatGPT, Gemini, Perplexity, and Claude.
- Sitemap is generated at build time from the route inventory.

## Operational dashboards

- **Student dashboard** (`/dashboard`) — manuscripts, progress, agent activity, readiness scores, concierge.
- **Admin dashboard** (`/admin`) — MRR, active subs, agent invocations, queue depth, QA reject rate, API p95, error rate, and per-agent performance table.
