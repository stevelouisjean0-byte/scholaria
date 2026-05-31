import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { nanoid } from "nanoid";
import { parseDocument } from "@/lib/document";

export const runtime = "nodejs";
export const maxDuration = 60;

const databaseConfigured = Boolean(process.env.DATABASE_URL);
const redisConfigured = Boolean(process.env.REDIS_URL);
const OWNER_INBOX = process.env.OWNER_INBOX_ADDRESS ?? "support@doctoralediting.com";

/**
 * Upload endpoint with graduated capability levels.
 *
 *   No DB, no Redis     → demo mode (parse only, return stats, no persistence)
 *   DB only             → persists job to Postgres; cron drives the pipeline
 *   DB + Redis          → persist + Redis enqueue (observability parity)
 *
 * Intake fields supported on the multipart form (all optional except `file`):
 *   firstName, lastName, email, phone, university, degreeProgram,
 *   dissertationStage, chapterUploaded, serviceRequested, notes
 *
 * Returns a sequential display ID (DEC-YYYY-NNNNNN) alongside the nanoid job id.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required", hint: "Choose a PDF or DOCX file to upload." }, { status: 400 });

  // Purchase gate — every upload requires a verified, unconsumed Stripe
  // checkout session id. Prevents the multi-email free-trial abuse vector.
  const purchaseSessionId = (form.get("purchaseSessionId") as string | null)?.trim();
  if (!purchaseSessionId) {
    return NextResponse.json(
      {
        error: "purchase_required",
        detail: "Every review requires a paid order on file.",
        hint: "Order a review at /pricing — you'll be returned to /upload with the form unlocked after payment.",
        upgradeUrl: "/pricing"
      },
      { status: 402 }
    );
  }
  const { verifyPurchaseSession } = await import("@/lib/purchases");
  const verified = await verifyPurchaseSession(purchaseSessionId);
  if (!verified.ok || !verified.purchase) {
    return NextResponse.json(
      {
        error: "purchase_invalid",
        detail: verified.reason ?? "Purchase verification failed.",
        hint: "Email support@doctoralediting.com with your Stripe receipt and we'll resolve it.",
        upgradeUrl: "/pricing"
      },
      { status: 402 }
    );
  }
  if (verified.purchase.consumed_at) {
    return NextResponse.json(
      {
        error: "purchase_consumed",
        detail: "That review credit has already been used on a previous upload.",
        hint: "Order another review at /pricing.",
        upgradeUrl: "/pricing"
      },
      { status: 402 }
    );
  }

  if (!/\.(pdf|docx)$/i.test(file.name)) {
    return NextResponse.json(
      { error: "unsupported_file_type", detail: "Only .pdf and .docx files are accepted.", hint: "Convert your document to PDF or DOCX and try again." },
      { status: 415 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "empty_file", detail: "The uploaded file appears to be empty (0 bytes).", hint: "Re-export the document and try again." },
      { status: 400 }
    );
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "file_too_large", detail: "Files larger than 50 MB are accepted only on Dissertation Intensive and Enterprise.", hint: "Trim the document or contact concierge for a custom upload link." },
      { status: 413 }
    );
  }

  // Intake fields. All optional from the API's perspective; UI enforces required.
  const intake = {
    firstName: str(form.get("firstName")),
    lastName: str(form.get("lastName")),
    email: str(form.get("email")),
    phone: str(form.get("phone")),
    university: str(form.get("university")),
    degreeProgram: str(form.get("degreeProgram")),
    dissertationStage: str(form.get("dissertationStage")),
    chapterUploaded: str(form.get("chapterUploaded")),
    serviceRequested: str(form.get("serviceRequested")),
    notes: str(form.get("notes"))
  };
  const fullName = [intake.firstName, intake.lastName].filter(Boolean).join(" ").trim();

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

  // No database — demo mode (parse only). Returns synthetic preview-id.
  if (!databaseConfigured) {
    return NextResponse.json({
      jobId,
      displayId: `DEC-PREVIEW-${jobId.slice(0, 6).toUpperCase()}`,
      stage: "received",
      demoMode: true,
      missing: { database: true, redis: !redisConfigured },
      document: documentInfo,
      message:
        "Manuscript parsed successfully. The autonomous pipeline activates once the platform's database is provisioned."
    });
  }

  // Database is set — persist the job.
  let persisted = false;
  let persistError: string | null = null;
  let displayId: string | null = null;
  const receivedAt = new Date();
  const deliveryToken = nanoid(32);

  try {
    const { db } = await import("@/lib/db");

    // Ensure the sequence + display_id column exist (idempotent).
    await db.query(`create sequence if not exists submission_seq start 142`);
    await db.query(`alter table jobs add column if not exists display_id text`);
    await db.query(`create unique index if not exists jobs_display_id_uidx on jobs(display_id)`);

    // Anonymous uploads need a placeholder users row to satisfy jobs.user_id FK.
    if (userId === "anonymous") {
      await db.query(
        `insert into users (id, email, full_name, plan)
         values ('anonymous', 'anonymous@dec.local', 'Anonymous Upload', 'trial')
         on conflict (id) do nothing`
      );
    }

    // Generate the sequential DEC-YYYY-NNNNNN display id.
    const seqRow = await db.query(`select nextval('submission_seq')::text as n`);
    const seq = parseInt(seqRow.rows[0].n as string, 10);
    const year = receivedAt.getUTCFullYear();
    displayId = `DEC-${year}-${String(seq).padStart(6, "0")}`;

    const uploadMeta = {
      sourceIp: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
      receivedAt: receivedAt.toISOString(),
      documentKind: parsed.kind,
      pageCount: parsed.pageCount,
      displayId,
      deliveryToken,
      intake
    };

    await db.query(
      `insert into jobs
         (id, user_id, filename, mime, size_bytes, stage, document, text_full, text_excerpt, word_count, upload_meta, reviews_expected, reviews_received, memory, display_id)
       values ($1,$2,$3,$4,$5,'uploaded',$6,$7,$8,$9,$10,0,0,'{"reviews":{}}'::jsonb,$11)`,
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
        uploadMeta,
        displayId
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
        hint: "Persistence layer is misconfigured. Please email concierge with the file and we'll process it manually.",
        document: documentInfo
      },
      { status: 503 }
    );
  }

  // Mark the purchase consumed (idempotent — guards against double-uploads
  // racing on the same session_id).
  try {
    const { consumePurchase } = await import("@/lib/purchases");
    await consumePurchase(purchaseSessionId, jobId);
  } catch (err) {
    console.warn("[upload] purchase consume failed (job is still persisted):", err);
  }

  // Advance to intake immediately so the cron picks it up.
  try {
    const { db } = await import("@/lib/db");
    await db.query(
      "update jobs set stage='intake', updated_at=now() - interval '30 seconds' where id=$1",
      [jobId]
    );
  } catch (err) {
    console.warn("[upload] failed to advance stage to intake:", err);
  }

  // Client confirmation email + owner notification email. Await both so
  // serverless runtimes cannot freeze the request before the sends complete.
  await sendNotificationEmails({
    jobId,
    displayId: displayId!,
    filename: file.name,
    wordCount: parsed.wordCount,
    sizeBytes,
    intake,
    fullName,
    receivedAt,
    deliveryToken
  });

  // Best-effort Redis enqueue (observability parity).
  if (redisConfigured) {
    try {
      const { enqueueIntake } = await import("@/lib/orchestrator");
      await enqueueIntake(jobId);
    } catch (err) {
      console.warn("[upload] enqueue to Redis failed (cron will still pick it up):", err);
    }
  }

  // Trigger the cron immediately for first-stage execution within seconds.
  triggerCron(req);

  return NextResponse.json({
    jobId,
    displayId,
    stage: "intake",
    persisted: true,
    pipelineActive: true,
    document: documentInfo,
    intakeCaptured: Boolean(intake.email || fullName),
    message:
      "Your dissertation has been successfully submitted. The Lead Intake Agent is reviewing your file now."
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

interface NotificationInput {
  jobId: string;
  displayId: string;
  filename: string;
  wordCount: number;
  sizeBytes: number;
  intake: Record<string, string>;
  fullName: string;
  receivedAt: Date;
  deliveryToken: string;
}

async function sendNotificationEmails(input: NotificationInput) {
  try {
    const { sendMail, uploadConfirmationEmail, ownerNotificationEmail } = await import("@/lib/email");

    // Client confirmation — only if client provided an email.
    if (input.intake.email && /.+@.+\..+/.test(input.intake.email)) {
      const mail = uploadConfirmationEmail({
        to: input.intake.email,
        jobId: input.jobId,
        displayId: input.displayId,
        filename: input.filename,
        wordCount: input.wordCount,
        firstName: input.intake.firstName,
        deliveryToken: input.deliveryToken
      });
      const res = await sendMail(mail);
      await recordUploadEmail(input.jobId, "notify.student.receipt", {
        to: input.intake.email,
        ok: res.ok,
        id: res.id,
        error: res.error
      });
    }

    // Owner notification — always fires (you want to know about every submission).
    const ownerMail = ownerNotificationEmail({
      to: OWNER_INBOX,
      jobId: input.jobId,
      displayId: input.displayId,
      filename: input.filename,
      wordCount: input.wordCount,
      sizeBytes: input.sizeBytes,
      fullName: input.fullName || "(not provided)",
      intake: input.intake,
      receivedAt: input.receivedAt
    });
    const ownerRes = await sendMail(ownerMail);
    await recordUploadEmail(input.jobId, "notify.owner.receipt", {
      to: OWNER_INBOX,
      ok: ownerRes.ok,
      id: ownerRes.id,
      error: ownerRes.error
    });
  } catch (err) {
    console.warn("[upload] notification scaffolding failed:", err);
  }
}

async function recordUploadEmail(jobId: string, event: string, payload: unknown) {
  try {
    const { recordWorkflowEvent } = await import("@/lib/telemetry");
    await recordWorkflowEvent(jobId, event, payload);
  } catch (err) {
    console.warn("[upload] failed to record notification event:", err);
  }
}

function triggerCron(req: NextRequest) {
  try {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host");
    if (!host) return;
    const cronUrl = `${proto}://${host}/api/cron/tick`;
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn("[upload] CRON_SECRET is not configured; scheduled cron must advance the job.");
      return;
    }
    waitUntil(fetch(cronUrl, {
      method: "POST",
      headers: { authorization: `Bearer ${cronSecret}` }
    }).catch(() => undefined));
  } catch {
    /* non-fatal */
  }
}
