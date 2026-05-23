# Scholaria

**Enterprise AI Dissertation Review & Scholarly Editing Platform.**
An autonomous, multi-agent academic intelligence ecosystem for Ph.D., Ed.D., doctoral, and graduate-level researchers — operated end-to-end by Claude Managed Agents.

---

## What this is

Scholaria is a fully autonomous scholarly editing platform. A student uploads a manuscript and the platform — without human intervention — runs intake, scopes the work, reviews it through a coordinated ecosystem of specialised agents, validates every output with a QA agent, and delivers an annotated document, APA report, citation cross-check, and prioritised revision plan.

The platform helps doctoral and graduate students **analyse, critique, edit, improve, guide, explain, and strengthen** their scholarly writing. It does not write dissertations on a student's behalf.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 App Router · Tailwind · Framer Motion · Lucide |
| Backend | Next.js route handlers · Node.js · TypeScript |
| Queues | BullMQ on Redis |
| Database | Postgres (Supabase-compatible) |
| AI | Claude Managed Agents via the Anthropic SDK |
| Auth | Clerk (drop-in) |
| Payments | Stripe |
| Storage | S3-compatible, envelope-encrypted |
| Hosting | Vercel (web) · containerised workers (Render/Fly/ECS) |

## Quick start

```bash
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY and the AGENT_* IDs from the Claude Console.

docker compose up postgres redis -d
npm install
npm run dev            # web
npm run worker         # background workers (separate terminal)
```

Open `http://localhost:3000`.

## Repository layout

```
app/                       Next.js App Router pages
  page.tsx                 Homepage
  services/                Service overview
  how-it-works/            Autonomous pipeline explainer
  upload/                  Upload flow
  pricing/                 Pricing
  dashboard/               Student dashboard
  admin/                   Admin / operations dashboard
  about/ · contact/ · faq/ · enterprise/
  dissertation-editing/    SEO landing
  apa-7-formatting/        SEO landing
  literature-review-editing/   SEO landing
  research-methodology-review/ SEO landing
  api/                     Route handlers
    upload/route.ts        Manuscript upload + queue enqueue
    orchestrate/route.ts   Manual re-trigger
    intake/route.ts        Direct intake submission
    jobs/[id]/route.ts     Job state + progress
    agents/route.ts        Public agent registry
    support/route.ts       Client Support Agent endpoint
    webhooks/stripe/       Billing webhook

components/                React components
  site-header.tsx · site-footer.tsx
  upload-zone.tsx · seo-page.tsx
  sections/*               Homepage sections

lib/
  agents.ts                Typed agent registry (IDs from env)
  claude.ts                Anthropic SDK wrapper
  orchestrator.ts          Workflow state machine
  memory.ts                Shared workflow memory
  queue.ts                 BullMQ queue + worker helpers
  db.ts · telemetry.ts
  stripe.ts · plans.ts

server/worker.ts           Background worker entrypoint
db/schema.sql              Postgres schema
docs/                      Architecture & agent reference
```

## Claude Managed Agent IDs

Agent IDs are loaded **exclusively** from environment variables — never committed.
The registry in [`lib/agents.ts`](lib/agents.ts) maps typed keys to env names:

| Key | Env (primary) | Env (backup) |
| --- | --- | --- |
| `lead_intake` | `AGENT_LEAD_INTAKE` | — |
| `project_scoping` | `AGENT_PROJECT_SCOPING` | — |
| `orchestrator` | `AGENT_ORCHESTRATOR` | — |
| `professional_editor` | `AGENT_PROFESSIONAL_EDITOR` | — |
| `research_support` | `AGENT_RESEARCH_SUPPORT` | — |
| `pricing_payment` | `AGENT_PRICING_PAYMENT_PRIMARY` | `AGENT_PRICING_PAYMENT_BACKUP` |
| `qa_final` | `AGENT_QA_FINAL_PRIMARY` | `AGENT_QA_FINAL_BACKUP` |
| `client_support` | `AGENT_CLIENT_SUPPORT` | — |
| `seo_growth` | `AGENT_SEO_GROWTH` | — |
| `survey_completion` | `AGENT_SURVEY_COMPLETION` | — |

`resolveAgentId()` falls back to the backup ID when the primary is missing and **fails loudly** if neither is configured — so the platform never silently routes to the wrong agent.

## Autonomous workflow

```
uploaded → intake → scoping → reviewing → qa → delivering → delivered
                                  │
                                  └─ recovery: failed reviews are requeued by QA
```

Every transition is durable. Every agent invocation is recorded. Every output is gated by QA before delivery. See [`lib/orchestrator.ts`](lib/orchestrator.ts) for the state machine and [`docs/architecture.md`](docs/architecture.md) for the full design.

## License

Proprietary. © Scholaria.
