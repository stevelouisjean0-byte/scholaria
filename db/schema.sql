-- =============================================================================
-- Scholaria — Postgres schema (Supabase-compatible)
--
-- Tables are designed to be the durable record of the autonomous workflow:
-- every upload, every agent invocation, every workflow event, and every
-- billing event is captured here so the platform is replayable and auditable.
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Users — minimal mirror of the Clerk identity, plus subscription state.
-- ----------------------------------------------------------------------------
create table if not exists users (
  id                text primary key,                -- Clerk user_id
  email             text not null unique,
  full_name         text,
  degree_level      text,                            -- "PhD", "EdD", "DBA", "Master's", ...
  program           text,
  institution       text,
  plan              text not null default 'trial',   -- trial|graduate|doctoral|dissertation|university
  stripe_customer   text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Jobs — one row per manuscript submitted for review. The memory column is
-- the shared workflow document that every agent reads from and writes to.
-- ----------------------------------------------------------------------------
create table if not exists jobs (
  id                  text primary key,
  user_id             text references users(id) on delete cascade,
  filename            text not null,
  mime                text,
  size_bytes          bigint,
  document            bytea,                           -- swap for s3 url in prod
  text_full           text,
  text_excerpt        text,
  word_count          int,
  stage               text not null default 'uploaded',
  reviews_expected    int not null default 0,
  reviews_received    int not null default 0,
  memory              jsonb not null default '{"reviews":{}}'::jsonb,
  upload_meta         jsonb,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists jobs_user_idx on jobs(user_id);
create index if not exists jobs_stage_idx on jobs(stage);
create index if not exists jobs_created_idx on jobs(created_at desc);

-- ----------------------------------------------------------------------------
-- Agent invocations — telemetry for every call into a Managed Agent. Powers
-- the admin dashboard and the SLA/QA reject monitors.
-- ----------------------------------------------------------------------------
create table if not exists agent_invocations (
  id                   bigserial primary key,
  job_id               text references jobs(id) on delete cascade,
  agent_key            text not null,
  agent_id             text not null,
  input_tokens         int default 0,
  output_tokens        int default 0,
  cached_read_tokens   int default 0,
  duration_ms          int default 0,
  ok                   boolean default true,
  error                text,
  created_at           timestamptz default now()
);
create index if not exists agent_invocations_job_idx on agent_invocations(job_id);
create index if not exists agent_invocations_agent_idx on agent_invocations(agent_key, created_at desc);

-- ----------------------------------------------------------------------------
-- Workflow events — durable, replayable workflow timeline.
-- ----------------------------------------------------------------------------
create table if not exists workflow_events (
  id          bigserial primary key,
  job_id      text references jobs(id) on delete cascade,
  event       text not null,
  payload     jsonb,
  occurred_at timestamptz default now()
);
create index if not exists workflow_events_job_idx on workflow_events(job_id, occurred_at);

-- ----------------------------------------------------------------------------
-- Findings — denormalised projection of memory.reviews[*].findings for fast
-- per-job listing, severity filtering, and annotation rendering.
-- ----------------------------------------------------------------------------
create table if not exists findings (
  id              text primary key,
  job_id          text references jobs(id) on delete cascade,
  agent_key       text not null,
  page            int,
  section         text,
  excerpt         text not null,
  issue           text not null,
  recommendation  text not null,
  severity        text not null,         -- minor|moderate|major
  finding_type    text not null,         -- tone|clarity|formatting|citation|synthesis|methodology|structure
  created_at      timestamptz default now()
);
create index if not exists findings_job_idx on findings(job_id);

-- ----------------------------------------------------------------------------
-- Billing — durable ledger of every Stripe event we have seen.
-- ----------------------------------------------------------------------------
create table if not exists billing_events (
  id          text primary key,          -- stripe event id
  type        text not null,
  payload     jsonb,
  received_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Support — conversational history with the Client Support Agent.
-- ----------------------------------------------------------------------------
create table if not exists support_threads (
  id          text primary key,
  user_id     text references users(id) on delete set null,
  job_id      text references jobs(id) on delete set null,
  subject     text,
  created_at  timestamptz default now()
);

create table if not exists support_messages (
  id          bigserial primary key,
  thread_id   text references support_threads(id) on delete cascade,
  role        text not null,             -- "user" | "assistant" | "system"
  content     text not null,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Survey responses — collected by the Survey Completion Bot post-delivery.
-- ----------------------------------------------------------------------------
create table if not exists surveys (
  id              bigserial primary key,
  user_id         text references users(id) on delete cascade,
  job_id          text references jobs(id) on delete cascade,
  csat            int,
  helpfulness     int,
  recommend       int,
  open_feedback   text,
  created_at      timestamptz default now()
);
