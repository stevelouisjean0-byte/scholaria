import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enqueueIntake } from "@/lib/orchestrator";
import { z } from "zod";

const schema = z.object({
  jobId: z.string(),
  degreeLevel: z.string(),
  assignmentType: z.string(),
  deadlineIso: z.string().nullable().optional(),
  formattingStyle: z.enum(["APA7", "APA6", "MLA", "Chicago", "Other"]).default("APA7"),
  professorFeedback: z.string().default(""),
  areasOfConcern: z.array(z.string()).default([])
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  await db.query(
    `update jobs set memory = jsonb_set(memory, '{intake}', $2::jsonb, true), updated_at = now() where id=$1`,
    [body.jobId, JSON.stringify(body)]
  );
  await enqueueIntake(body.jobId);
  return NextResponse.json({ ok: true, jobId: body.jobId });
}
