/**
 * Thin wrapper around the Anthropic SDK for invoking Claude Managed Agents.
 *
 * The platform talks to agents through a single typed surface so that callers
 * never need to know the underlying SDK shape, the model defaults, or how
 * prompt caching is configured. Every call records latency and token usage
 * for the observability layer.
 */
import Anthropic from "@anthropic-ai/sdk";
import { AgentKey, getAgent, resolveAgentId } from "./agents";
import { recordAgentInvocation } from "./telemetry";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AgentInvocationInput {
  agent: AgentKey;
  jobId: string;
  task: string;
  context?: Record<string, unknown>;
  system?: string;
  maxTokens?: number;
  cacheable?: boolean;
}

export interface AgentInvocationResult {
  agent: AgentKey;
  agentId: string;
  jobId: string;
  text: string;
  raw: unknown;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  cachedReadTokens: number;
}

const DEFAULT_MODEL = process.env.ANTHROPIC_DEFAULT_MODEL ?? "claude-opus-4-7";

export async function invokeAgent(input: AgentInvocationInput): Promise<AgentInvocationResult> {
  const def = getAgent(input.agent);
  const agentId = resolveAgentId(input.agent);
  const started = Date.now();

  const system = buildSystemPrompt(def.role, input.system, input.cacheable);
  const userBlocks = buildUserMessage(input.task, input.context);

  // Cast away the `Message | Stream` union — we never set `stream: true` so
  // the SDK always returns a `Message`. Narrowing here keeps the call site
  // typed without forcing every caller to handle the streaming branch.
  const response = (await client.messages.create(
    {
      model: DEFAULT_MODEL,
      max_tokens: input.maxTokens ?? 4096,
      metadata: { user_id: input.jobId },
      system,
      messages: [{ role: "user", content: userBlocks }]
    } as Parameters<typeof client.messages.create>[0],
    {
      // The Managed Agent ID is passed as a header for routing/governance — the
      // Console-managed system prompt, tools, and guardrails take precedence
      // when this header is present.
      headers: { "anthropic-managed-agent": agentId }
    }
  )) as Anthropic.Message;

  const text = response.content
    .filter((b: Anthropic.ContentBlock): b is Anthropic.TextBlock => b.type === "text")
    .map((b: Anthropic.TextBlock) => b.text)
    .join("\n\n");

  const usage = response.usage as Anthropic.Usage & {
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };

  const result: AgentInvocationResult = {
    agent: input.agent,
    agentId,
    jobId: input.jobId,
    text,
    raw: response,
    durationMs: Date.now() - started,
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cachedReadTokens: usage.cache_read_input_tokens ?? 0
  };

  await recordAgentInvocation(result);
  return result;
}

function buildSystemPrompt(role: string, custom: string | undefined, cacheable: boolean | undefined) {
  const base = [
    "You are an autonomous reviewing agent in the Scholaria scholarly-editing platform.",
    `Your role: ${role}`,
    "Every output you produce is read directly by doctoral and graduate students or by downstream agents.",
    "",
    "Writing rules — non-negotiable:",
    "- Sound like a thoughtful, senior human editor at a top dissertation consultancy.",
    "- Never produce text that reads as AI-generated, generic, robotic, or template-driven.",
    "- Vary sentence rhythm. Avoid filler hedges, throat-clearing, and listy boilerplate.",
    "- Be explicit, specific, and actionable. Reference exact passages, sections, citations, or pages.",
    "- Default to publication-quality scholarly English in an executive register.",
    "- Never write the student's dissertation for them — you analyse, critique, edit, improve, guide, explain, and strengthen."
  ].join("\n");

  const tail = custom ? `\n\n---\n${custom}` : "";

  if (cacheable) {
    return [
      { type: "text", text: base + tail, cache_control: { type: "ephemeral" } }
    ];
  }
  return base + tail;
}

function buildUserMessage(task: string, context?: Record<string, unknown>) {
  if (!context) return [{ type: "text" as const, text: task }];
  return [
    { type: "text" as const, text: task },
    {
      type: "text" as const,
      text: "\n\n<context>\n" + JSON.stringify(context, null, 2) + "\n</context>"
    }
  ];
}
