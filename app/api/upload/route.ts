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
    // Anonymous uploads need a placeholder users row to satisfy jobs.user_id FK.
    if (userId === "anonymous") {
      await db.query(
        `insert into users (id, email, full_name, plan)
         values ('anonymous', 'anonymous@scholaria.local', 'Anonymous Upload', 'trial')
         on conflict (id) do nothing`
      );
    }
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

  // Mark the job as ready for the autonomous pipeline. The serverless cron at
  // /api/cron/tick reads `jobs.stage` from Postgres and advances each row one
  // stage per invocation — so as long as DATABASE_URL is set, the Agentic AI
  // Agents will run, even if Redis is missing.
  try {
    await (await import("@/lib/db")).db.query(
      "update jobs set stage='intake', updated_at=now() where id=$1",
      [jobId]
    );
  } catch (err) {
    console.warn("[upload] failed to advance stage to intake:", err);
  }

  // Transactional confirmation email — fire-and-forget, never blocks the upload.
  // Captures an email from the form if present (free-trial upload zone supplies
  // it as form field "email"); otherwise pulls from the linked user record.
  const formEmail = (form.get("email") as string | null)?.trim() || null;
  if (formEmail || userId !== "anonymous") {
    try {
      const { sendMail, uploadConfirmationEmail } = await import("@/lib/email");
      let recipient = formEmail;
      if (!recipient && userId !== "anonymous") {
        const { rows } = await (await import("@/lib/db")).db.query(
          "select email from users where id=$1 limit 1",
          [userId]
        );
        recipient = rows[0]?.email ?? null;
      }
      if (recipient) {
        const mail = uploadConfirmationEmail({
          to: recipient,
          jobId,
          filename: file.name,
          wordCount: parsed.wordCount
        });
        // Do not await — never block the upload response on email delivery.
        sendMail(mail).catch(() => undefined);
      }
    } catch (err) {
      console.warn("[upload] email scaffolding failed:", err);
    }
  }

  // Best-effort: also push into the Redis BullMQ queue for observability/parity
  // with the standalone worker. Cron is authoritative; this is non-blocking.
  if (redisConfigured) {
    try {
      const { enqueueIntake } = await import("@/lib/orchestrator");
      await enqueueIntake(jobId);
    } catch (err) {
      console.warn("[upload] enqueue to Redis failed (cron will still pick it up):", err);
    }
  }

  // Trigger the cron immediately so the Lead Intake Agent runs within seconds,
  // not at the top of the next minute. Fire-and-forget — the upload response
  // returns straight away, and the cron handler runs to completion in its own
  // serverless invocation.
  try {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host");
    if (host) {
      const cronUrl = `${proto}://${host}/api/cron/tick`;
      const cronSecret = process.env.CRON_SECRET;
      // Do not await — fetch is fire-and-forget so the upload returns fast.
      fetch(cronUrl, {
        method: "POST",
        headers: cronSecret ? { authorization: `Bearer ${cronSecret}` } : undefined
      }).catch(() => undefined);
    }
  } catch {
    // Non-fatal: cron runs every minute regardless.
  }

  return NextResponse.json({
    jobId,
    stage: "intake",
    persisted: true,
    pipelineActive: true,
    document: documentInfo,
    message:
      "Manuscript received and persisted. The Lead Intake Agent has been engaged and the autonomous review pipeline is starting."
  });
}
