import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { readMemory } from "@/lib/memory";
import { recordWorkflowEvent } from "@/lib/telemetry";
import { sendMail, reviewReadyEmail, ownerDeliveryEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: re-send the delivery notification email for an already-
 * delivered job, without re-running the agent pipeline. Useful for
 * re-trying after an email-send failure, or for confirming email setup
 * after wiring changes. Same dual auth as the rest of /api/admin.
 *
 * POST /api/admin/resend-delivery?id=<jobId-or-displayId>
 *      [&to=<override-email>]    // optional, overrides intake.email
 *      [&skipOwner=1]            // skip the owner-inbox copy
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    const auth = req.headers.get("authorization") ?? "";
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  const toOverride = url.searchParams.get("to");
  const skipOwner = url.searchParams.get("skipOwner") === "1";
  if (!idParam) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const { rows } = await db.query(
    "select id, display_id, filename, stage, upload_meta from jobs where id=$1 or display_id=$1 limit 1",
    [idParam]
  );
  if (!rows.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const job = rows[0];
  if (job.stage !== "delivered") {
    return NextResponse.json({ error: "not_delivered", stage: job.stage }, { status: 400 });
  }

  const mem = await readMemory(job.id);
  if (!mem.report?.executiveSummary) {
    return NextResponse.json({ error: "no_report" }, { status: 400 });
  }

  const intake = (mem.intake ?? {}) as Record<string, any>;
  const studentEmail = (toOverride || String(intake.email ?? "")).trim();
  const firstName = String(intake.firstName ?? "").trim() || undefined;
  const fullName = [intake.firstName, intake.lastName].filter(Boolean).join(" ").trim();
  const displayId = job.display_id ?? job.id;
  const filename = job.filename ?? "your manuscript";
  let deliveryToken = (job.upload_meta?.deliveryToken as string | undefined) ?? undefined;
  if (!deliveryToken) {
    deliveryToken = randomBytes(24).toString("base64url");
    await db.query(
      `update jobs
          set upload_meta = coalesce(upload_meta, '{}'::jsonb) || jsonb_build_object('deliveryToken', $2::text),
              updated_at = now()
        where id = $1`,
      [job.id, deliveryToken]
    );
  }

  const results: Record<string, any> = {};

  if (studentEmail) {
    const mail = reviewReadyEmail({
      to: studentEmail,
      jobId: job.id,
      displayId,
      filename,
      firstName,
      readiness: mem.qa?.submissionReadiness,
      quality: mem.qa?.qualityScore,
      executiveSummary: mem.report.executiveSummary,
      revisionPlan: mem.report.revisionPlan,
      deliveryToken
    });
    const res = await sendMail(mail);
    results.student = { to: studentEmail, ...res };
    await recordWorkflowEvent(job.id, "notify.student.resend", {
      to: studentEmail,
      ...res
    });
  } else {
    results.student = { skipped: "no_email" };
  }

  if (!skipOwner) {
    const ownerInbox = process.env.OWNER_INBOX_ADDRESS;
    if (ownerInbox) {
      const ownerMail = ownerDeliveryEmail({
        to: ownerInbox,
        jobId: job.id,
        displayId,
        studentEmail,
        fullName,
        filename,
        readiness: mem.qa?.submissionReadiness,
        quality: mem.qa?.qualityScore
      });
      const res = await sendMail(ownerMail);
      results.owner = { to: ownerInbox, ...res };
      await recordWorkflowEvent(job.id, "notify.owner.resend", {
        to: ownerInbox,
        ...res
      });
    } else {
      results.owner = { skipped: "no_OWNER_INBOX_ADDRESS" };
    }
  }

  return NextResponse.json({
    ok: true,
    jobId: job.id,
    displayId,
    results
  });
}
