import { NextRequest, NextResponse } from "next/server";
import { invokeAgent } from "@/lib/claude";
import { nanoid } from "nanoid";
import { rateLimit, callerIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Public contact-form / support endpoint. Invokes the Client Support Agent.
 * Rate-limited per-IP: 5 messages per hour. Without the limit, an attacker
 * could spam this endpoint and burn Anthropic credits at ~$0.05/call.
 */
export async function POST(req: NextRequest) {
  const ip = callerIp(req);
  const rl = await rateLimit({ key: ip, route: "support", limit: 5, windowSec: 3600 });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        detail: "Too many support requests from this IP. Please email support@doctoralediting.com directly.",
        retryAfterSec: rl.retryAfterSec
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 3600) } }
    );
  }

  let body: { jobId?: string; message?: string; history?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });
  if (message.length > 4000) {
    return NextResponse.json({ error: "message too long", detail: "Max 4000 characters." }, { status: 413 });
  }

  const out = await invokeAgent({
    agent: "client_support",
    jobId: body.jobId ?? `support-${nanoid(8)}`,
    task: message,
    context: { history: body.history },
    system:
      "You are speaking with a doctoral or graduate student about their manuscript or account. " +
      "Stay in a calm, scholarly, executive register. Be specific and concrete; never use generic SaaS support boilerplate."
  });

  return NextResponse.json({ reply: out.text });
}
