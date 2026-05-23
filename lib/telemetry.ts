import { AgentInvocationResult } from "./claude";
import { db } from "./db";

export async function recordAgentInvocation(r: AgentInvocationResult) {
  try {
    await db.query(
      `insert into agent_invocations
        (job_id, agent_key, agent_id, input_tokens, output_tokens, cached_read_tokens, duration_ms, ok)
       values ($1,$2,$3,$4,$5,$6,$7,true)`,
      [r.jobId, r.agent, r.agentId, r.inputTokens, r.outputTokens, r.cachedReadTokens, r.durationMs]
    );
  } catch (err) {
    console.warn("[telemetry] failed to record agent invocation", err);
  }
}

export async function recordWorkflowEvent(jobId: string, event: string, payload?: unknown) {
  try {
    await db.query(
      `insert into workflow_events (job_id, event, payload) values ($1,$2,$3)`,
      [jobId, event, payload ? JSON.stringify(payload) : null]
    );
  } catch (err) {
    console.warn("[telemetry] failed to record workflow event", err);
  }
}
