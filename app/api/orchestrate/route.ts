import { NextRequest, NextResponse } from "next/server";
import { enqueueIntake } from "@/lib/orchestrator";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { jobId } = (await req.json()) as { jobId?: string };
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
  await enqueueIntake(jobId);
  return NextResponse.json({ jobId, stage: "intake", queued: true });
}
