import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { rows } = await db.query(
    `select id, user_id, filename, stage, reviews_expected, reviews_received,
            memory, created_at, updated_at
     from jobs where id=$1`,
    [params.id]
  );
  if (!rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  const j = rows[0];
  return NextResponse.json({
    jobId: j.id,
    filename: j.filename,
    stage: j.stage,
    progress: progressFor(j.stage, j.reviews_received, j.reviews_expected),
    memory: j.memory,
    createdAt: j.created_at,
    updatedAt: j.updated_at
  });
}

function progressFor(stage: string, received: number, expected: number) {
  const base = {
    uploaded: 5,
    intake: 15,
    scoping: 25,
    reviewing: 40,
    qa: 80,
    delivering: 92,
    delivered: 100,
    failed: 100
  }[stage] ?? 0;
  if (stage === "reviewing" && expected > 0) {
    return Math.min(80, 40 + Math.round((received / expected) * 35));
  }
  return base;
}
