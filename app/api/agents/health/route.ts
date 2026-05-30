/**
 * Agent health check — pings every Claude Managed Agent with a minimal
 * call and returns success / failure / latency per agent. Used by
 * /admin/agents-health and by any external monitor.
 *
 *   GET /api/agents/health
 *
 * Response shape:
 *   {
 *     ok: boolean,
 *     summary: { healthy: n, degraded: n, missing: n },
 *     agents: [{ key, name, tier, status, latencyMs?, error?, agentIdMasked?, hasPrimary, hasBackup }]
 *   }
 *
 * Status values:
 *   - "healthy"   : ping returned a Message with content
 *   - "degraded"  : SDK returned but response was empty / unexpected
 *   - "missing"   : no agent ID configured for this key
 *   - "error"     : SDK threw (typically: bad API key, 404 on agent ID, 429 rate limit)
 *
 * This route does NOT exfiltrate secrets. Agent IDs are masked to the last
 * six characters before being returned.
 */
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AgentKey, getAgent, listAgents, resolveAgentId } from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AgentHealth {
  key: AgentKey;
  name: string;
  tier: string;
  status: "healthy" | "degraded" | "missing" | "error";
  latencyMs?: number;
  error?: string;
  agentIdMasked?: string;
  hasPrimary: boolean;
  hasBackup: boolean;
}

const PING_PROMPT =
  "Reply with the single word: ready. Do not preface or elaborate.";

export async function GET() {
  // Admin-only. Pinging all agents costs real money (~$0.10–$0.50 per call
  // depending on agent count). Public access = trivial Anthropic bill DoS.
  try {
    const { requireAdmin } = await import("@/lib/admin");
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        summary: { healthy: 0, degraded: 0, missing: listAgents().length, error: 0 },
        agents: listAgents().map((a) => ({
          key: a.key,
          name: a.name,
          tier: a.tier,
          status: "missing" as const,
          hasPrimary: false,
          hasBackup: Boolean(a.envBackup)
        })),
        message:
          "ANTHROPIC_API_KEY is not set in this environment. Set it (locally in .env.local, in Vercel Project → Settings → Environment Variables) and reload."
      },
      { status: 200 }
    );
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_FAST_MODEL ?? "claude-haiku-4-5-20251001";

  const results = await Promise.all(
    listAgents().map(async (def): Promise<AgentHealth> => {
      const hasPrimary = Boolean(process.env[def.envPrimary]) &&
        !process.env[def.envPrimary]!.startsWith("agent_...");
      const hasBackup = Boolean(def.envBackup && process.env[def.envBackup!]) &&
        !process.env[def.envBackup!]!.startsWith("agent_...");

      if (!hasPrimary && !hasBackup) {
        return {
          key: def.key,
          name: def.name,
          tier: def.tier,
          status: "missing",
          hasPrimary,
          hasBackup
        };
      }

      let agentId: string;
      try {
        agentId = resolveAgentId(def.key);
      } catch (err) {
        return {
          key: def.key,
          name: def.name,
          tier: def.tier,
          status: "missing",
          error: err instanceof Error ? err.message : "Unresolvable",
          hasPrimary,
          hasBackup
        };
      }

      const t0 = Date.now();
      try {
        const response = (await client.messages.create(
          {
            model,
            max_tokens: 16,
            messages: [{ role: "user", content: PING_PROMPT }]
          },
          {
            headers: { "anthropic-managed-agent": agentId }
          }
        )) as Anthropic.Message;

        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("")
          .trim()
          .toLowerCase();

        const ok = text.length > 0;
        return {
          key: def.key,
          name: def.name,
          tier: def.tier,
          status: ok ? "healthy" : "degraded",
          latencyMs: Date.now() - t0,
          agentIdMasked: mask(agentId),
          hasPrimary,
          hasBackup
        };
      } catch (err) {
        return {
          key: def.key,
          name: def.name,
          tier: def.tier,
          status: "error",
          latencyMs: Date.now() - t0,
          error: err instanceof Error ? err.message : String(err),
          agentIdMasked: mask(agentId),
          hasPrimary,
          hasBackup
        };
      }
    })
  );

  const summary = {
    healthy: results.filter((r) => r.status === "healthy").length,
    degraded: results.filter((r) => r.status === "degraded").length,
    missing: results.filter((r) => r.status === "missing").length,
    error: results.filter((r) => r.status === "error").length
  };

  return NextResponse.json(
    {
      ok: summary.healthy === results.length,
      summary,
      agents: results,
      checkedAt: new Date().toISOString(),
      model
    },
    { status: 200 }
  );
}

function mask(id: string): string {
  if (id.length <= 10) return id;
  return id.slice(0, 6) + "…" + id.slice(-6);
}
