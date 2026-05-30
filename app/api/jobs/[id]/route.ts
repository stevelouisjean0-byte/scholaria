import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/jobs/[id]
 *
 * Returns the job's status payload (memory, scores, executive summary, etc.).
 * Contains PII so authorization is required:
 *   - Admin → can read any job
 *   - Otherwise → must be the Clerk user who owns the job (jobs.user_id match)
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  // Admin shortcut.
  let isAdmin = false;
  let viewerClerkId: string | null = null;
  try {
    const { requireAdmin } = await import("@/lib/admin");
    isAdmin = Boolean(await requireAdmin());
  } catch {
    /* fall through */
  }
  if (!isAdmin) {
    try {
      const { clerkEnabled } = await import("@/lib/clerk-config");
      if (clerkEnabled) {
        const { auth } = await import("@clerk/nextjs/server");
        const a = await auth();
        viewerClerkId = a.userId ?? null;
      }
    } catch {
      /* fall through — no viewer id */
    }
  }

  const { rows } = await db.query(
    `select id, user_id, filename, stage, reviews_expected, reviews_received,
            memory, created_at, updated_at
       from jobs where id=$1`,
    [params.id]
  );
  if (!rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  const j = rows[0];

  // Authorization. Admin sees everything. Otherwise: viewer must own the job.
  // We treat `user_id = 'anonymous'` as private — never readable via this API
  // without admin role, even though the upload page sets that for unauth uploads.
  if (!isAdmin) {
    if (!viewerClerkId || j.user_id !== viewerClerkId) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

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
