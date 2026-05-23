import { NextRequest, NextResponse } from "next/server";
import { invokeAgent } from "@/lib/claude";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { jobId, message, history } = (await req.json()) as {
    jobId?: string;
    message: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const out = await invokeAgent({
    agent: "client_support",
    jobId: jobId ?? `support-${nanoid(8)}`,
    task: message,
    context: { history },
    system:
      "You are speaking with a doctoral or graduate student about their manuscript or account. " +
      "Stay in a calm, scholarly, executive register. Be specific and concrete; never use generic SaaS support boilerplate."
  });

  return NextResponse.json({ reply: out.text });
}
