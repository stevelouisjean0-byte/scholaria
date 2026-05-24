import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { parseDocument } from "@/lib/document";

export const runtime = "nodejs";
export const maxDuration = 60;

const databaseConfigured = Boolean(process.env.DATABASE_URL);
const redisConfigured = Boolean(process.env.REDIS_URL);

/**
 * Upload endpoint with graduated capability levels.
 *
 *   No DB, no Redis     → demo mode (parse only, return stats, no persistence)
 *   DB only             → persists job to Postgres; orchestrator skipped
 *                         (review pipeline activates when Redis added)
 *   DB + Redis          → full mode (persist + enqueue full review pipeline)
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  if (!/\.(pdf|docx)$/i.test(file.name)) {
    return NextResponse.json({ error: "only .pdf or .docx supported" }, { status: 415 });
  }

  const userId = (form.get("userId") as string | null) ?? "anonymous";
  const jobId = nanoid(14);
  const buf = Buffer.from(await file.arrayBuffer());
  const sizeBytes = buf.byteLength;

  let parsed;
  try {
    parsed = await parseDocument(buf, file.name);
  } catch (err) {
    return NextResponse.json(
      {
        error: "document_parse_failed",
        detail: err instanceof Error ? err.message : "Unknown parse error.",
        hint:
          "If this is a scanned PDF, run OCR first. If it is encrypted, remove the password and re-upload."
      },
      { status: 422 }
    );
  }

  const documentInfo = {
    kind: parsed.kind,
    wordCount: parsed.wordCount,
    pageCount: parsed.pageCount,
    excerpt: parsed.excerpt.slice(0, 280),
    sizeBytes
  };

  // No database at all — pure demo mode.
  if (!databaseConfigured) {
    return NextResponse.json({
      jobId,
      stage: "received",
      demoMode: true,
      missing: { database: true, redis: !redisConfigured },
      document: documentInfo,
      message:
        "Manuscript parsed successfully. The autonomous pipeline activates once the platform's database and queue are provisioned."
    });
  }

  // Database is set — persist the job. Try/catch keeps the route up even if
  // the DB call fails (bad credentials, network blip, etc.).
  let persisted = false;
  let persistError: string | null = null;
  try {
    const { db } = await import("@/lib/db");
    await db.query(
      `insert into jobs
         (id, user_id, filename, mime, size_bytes, stage, document, text_full, text_excerpt, word_count, upload_meta, reviews_expected, reviews_received, memory)
       values ($1,$2,$3,$4,$5,'uploaded',$6,$7,$8,$9,$10,0,0,'{"reviews":{}}'::jsonb)`,
      [
        jobId,
        userId,
        file.name,
        file.type,
        sizeBytes,
        buf,
        parsed.text,
        parsed.excerpt,
        parsed.wordCount,
        {
          sourceIp: req.headers.get("x-forwarded-for") ?? null,
          userAgent: req.headers.get("user-agent") ?? null,
          receivedAt: new Date().toISOString(),
          documentKind: parsed.kind,
          pageCount: parsed.pageCount
        }
      ]
    );
    persisted = true;
  } catch (err) {
    persistError = err instanceof Error ? err.message : "Database write failed";
  }

  if (!persisted) {
    return NextResponse.json(
      {
        error: "database_error",
        detail: persistError ?? "Unknown",
        hint: "DATABASE_URL is configured but writes are failing. Check Vercel logs.",
        document: documentInfo
      },
      { status: 503 }
    );
  }

  // Try to enqueue the review pipeline if Redis is also configured.
  let enqueued = false;
  if (redisConfigured) {
    try {
      const { enqueueIntake } = await import("@/lib/orchestrator");
      await enqueueIntake(jobId);
      enqueued = true;
    } catch (err) {
      console.warn("[upload] enqueue failed (job is persisted, will be retried):", err);
    }
  }

  return NextResponse.json({
    jobId,
    stage: enqueued ? "uploaded" : "queued-pending-worker",
    persisted: true,
    pipelineActive: enqueued,
    document: documentInfo,
    message: enqueued
      ? "Manuscript received and persisted. The Lead Intake Agent has been engaged and the autonomous review pipeline is starting."
      : "Manuscript persisted to the job ledger. The autonomous review pipeline will activate the moment the queue worker (Redis) is provisioned — this job will then run automatically."
  });
}
