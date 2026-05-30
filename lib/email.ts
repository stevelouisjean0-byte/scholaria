/**
 * Transactional email — Resend-compatible thin wrapper.
 *
 * No-op when RESEND_API_KEY is not configured, so the upload route never
 * fails because email delivery is misconfigured. The route logs the intent
 * either way so observability is intact.
 */

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_ADDR = process.env.RESEND_FROM_ADDRESS ?? "Dissertation Editing Center <onboarding@resend.dev>";

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail(input: MailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_KEY) {
    console.log("[email] (no-op — RESEND_API_KEY not set)", input.to, input.subject);
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_ADDR,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[email] send failed:", res.status, errText);
      return { ok: false, error: `${res.status}: ${errText.slice(0, 200)}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    console.warn("[email] threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dissertationeditingcenter.com";

export function uploadConfirmationEmail(opts: {
  to: string;
  jobId: string;
  displayId?: string;
  filename: string;
  wordCount: number;
  firstName?: string;
  planEta?: string;
}): MailInput {
  const eta = opts.planEta ?? "within 24 hours (6–12 hours on Dissertation Intensive)";
  const greeting = opts.firstName ? `Hi ${escape(opts.firstName)},` : "Hi,";
  const display = opts.displayId ?? opts.jobId;
  const html = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1d2b; line-height: 1.55;">
  <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
    <div style="font-family: Newsreader, Georgia, serif; font-size: 22px; color: #1a1d2b;">Dissertation Editing Center</div>
    <div style="font-size: 12px; color: #6b7280; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 4px;">Submission confirmed · ${escape(display)}</div>
  </div>

  <p>${greeting}</p>
  <p>Your dissertation has been successfully submitted. The Lead Intake Agent is reviewing your file now.</p>

  <table cellpadding="0" cellspacing="0" style="margin: 18px 0; font-size: 14px;">
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Submission ID</td><td style="font-family: 'JetBrains Mono', Consolas, monospace; padding: 4px 0; font-weight: 600;">${escape(display)}</td></tr>
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Manuscript</td><td style="padding: 4px 0;">${escape(opts.filename)}</td></tr>
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Word count</td><td style="padding: 4px 0;">${opts.wordCount.toLocaleString()}</td></tr>
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Estimated turnaround</td><td style="padding: 4px 0;">${eta}</td></tr>
  </table>

  <h3 style="font-family: Newsreader, Georgia, serif; font-weight: normal; font-size: 16px; margin: 28px 0 8px;">What happens next</h3>
  <ol style="font-size: 13.5px; color: #3d4557; line-height: 1.7; padding-left: 18px; margin: 0;">
    <li>File received and queued (done)</li>
    <li>Lead Intake — capturing context (in progress)</li>
    <li>Project Scoping — routing your review</li>
    <li>Editor &amp; methodology review (parallel)</li>
    <li>QA &amp; Final Approval</li>
    <li>Delivery — annotated PDF, APA report, revision plan, emailed to you</li>
  </ol>

  <p style="margin: 28px 0;">
    <a href="${BASE}/status/${opts.jobId}" style="display: inline-block; background: #1a1d2b; color: #fff; padding: 10px 18px; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 14px;">Track your review →</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

  <p style="font-size: 13px; color: #6b7280;">
    Questions? Reply to this email or contact founder Steve Louis-Jean at <a href="mailto:support@doctoralediting.com" style="color: #1a1d2b;">support@doctoralediting.com</a> · (407) 850-8823.<br />
    14-day money-back guarantee · Cancel anytime
  </p>
</body></html>`;

  const text = [
    "Dissertation Editing Center — Submission confirmed",
    "",
    `${greeting.replace(/<[^>]+>/g, "")}`,
    "",
    "Your dissertation has been successfully submitted. The Lead Intake Agent is reviewing your file now.",
    "",
    `Submission ID:     ${display}`,
    `Manuscript:        ${opts.filename}`,
    `Word count:        ${opts.wordCount.toLocaleString()}`,
    `Estimated time:    ${eta}`,
    "",
    "What happens next:",
    "  1. File received and queued (done)",
    "  2. Lead Intake — capturing context (in progress)",
    "  3. Project Scoping — routing your review",
    "  4. Editor & methodology review (parallel)",
    "  5. QA & Final Approval",
    "  6. Delivery — annotated PDF, APA report, revision plan, emailed to you",
    "",
    `Track your review: ${BASE}/status/${opts.jobId}`,
    "",
    "Questions? Reply to this email or contact founder Steve Louis-Jean directly:",
    "  support@doctoralediting.com  ·  (407) 850-8823",
    "",
    "14-day money-back guarantee. Cancel anytime."
  ].join("\n");

  return {
    to: opts.to,
    subject: `Submission confirmed — ${display}`,
    html,
    text,
    replyTo: "support@doctoralediting.com"
  };
}

export function ownerNotificationEmail(opts: {
  to: string;
  jobId: string;
  displayId: string;
  filename: string;
  wordCount: number;
  sizeBytes: number;
  fullName: string;
  intake: Record<string, string>;
  receivedAt: Date;
}): MailInput {
  const intakeRows = Object.entries({
    Name: opts.fullName,
    Email: opts.intake.email,
    Phone: opts.intake.phone,
    University: opts.intake.university,
    "Degree program": opts.intake.degreeProgram,
    "Dissertation stage": opts.intake.dissertationStage,
    "Chapter uploaded": opts.intake.chapterUploaded,
    "Service requested": opts.intake.serviceRequested,
    Notes: opts.intake.notes
  })
    .filter(([, v]) => v && v !== "(not provided)")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;vertical-align:top;">${escape(k)}</td><td style="padding:4px 0;">${escape(String(v)).replace(/\n/g, "<br/>")}</td></tr>`
    )
    .join("");

  const sizeKb = (opts.sizeBytes / 1024).toFixed(1);
  const ts = opts.receivedAt.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const html = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1d2b;line-height:1.55;">
  <div style="border-bottom:1px solid #e5e7eb;padding-bottom:14px;margin-bottom:20px;">
    <div style="font-family:Newsreader,Georgia,serif;font-size:18px;">New submission · ${escape(opts.displayId)}</div>
    <div style="font-size:11px;color:#6b7280;letter-spacing:.18em;text-transform:uppercase;margin-top:2px;">Dissertation Editing Center · admin alert</div>
  </div>

  <table cellpadding="0" cellspacing="0" style="font-size:13.5px;width:100%;">
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Submission ID</td><td style="font-family:'JetBrains Mono',Consolas,monospace;font-weight:600;">${escape(opts.displayId)}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Internal job ID</td><td style="font-family:'JetBrains Mono',Consolas,monospace;font-size:11.5px;">${escape(opts.jobId)}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Filename</td><td>${escape(opts.filename)}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Word count</td><td>${opts.wordCount.toLocaleString()}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Size</td><td>${sizeKb} KB</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Received at</td><td>${ts}</td></tr>
  </table>

  <h3 style="font-family:Newsreader,Georgia,serif;font-weight:normal;font-size:15px;margin:24px 0 6px;">Client</h3>
  <table cellpadding="0" cellspacing="0" style="font-size:13.5px;width:100%;">
    ${intakeRows || `<tr><td style="color:#6b7280;font-style:italic;">No intake fields supplied (anonymous upload).</td></tr>`}
  </table>

  <p style="margin:28px 0;">
    <a href="${BASE}/status/${opts.jobId}" style="display:inline-block;background:#1a1d2b;color:#fff;padding:9px 16px;border-radius:9999px;text-decoration:none;font-weight:500;font-size:13.5px;margin-right:6px;">Open status</a>
    <a href="${BASE}/api/admin/jobs" style="display:inline-block;background:#f3f4f6;color:#1a1d2b;padding:9px 16px;border-radius:9999px;text-decoration:none;font-weight:500;font-size:13.5px;">Admin ledger</a>
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
  <p style="font-size:11.5px;color:#6b7280;">Automatic notification from the upload route. To suppress: set OWNER_INBOX_ADDRESS to a different address or remove the env var.</p>
</body></html>`;

  const text = [
    `Dissertation Editing Center — New submission ${opts.displayId}`,
    "",
    `Submission ID:    ${opts.displayId}`,
    `Internal job ID:  ${opts.jobId}`,
    `Filename:         ${opts.filename}`,
    `Word count:       ${opts.wordCount.toLocaleString()}`,
    `Size:             ${sizeKb} KB`,
    `Received:         ${ts}`,
    "",
    "Client:",
    `  Name:                ${opts.fullName}`,
    `  Email:               ${opts.intake.email || "(not provided)"}`,
    `  Phone:               ${opts.intake.phone || "(not provided)"}`,
    `  University:          ${opts.intake.university || "(not provided)"}`,
    `  Degree program:      ${opts.intake.degreeProgram || "(not provided)"}`,
    `  Dissertation stage:  ${opts.intake.dissertationStage || "(not provided)"}`,
    `  Chapter uploaded:    ${opts.intake.chapterUploaded || "(not provided)"}`,
    `  Service requested:   ${opts.intake.serviceRequested || "(not provided)"}`,
    `  Notes:               ${opts.intake.notes || "(none)"}`,
    "",
    `Status:           ${BASE}/status/${opts.jobId}`,
    `Admin ledger:     ${BASE}/api/admin/jobs`
  ].join("\n");

  return {
    to: opts.to,
    subject: `[DEC] New submission ${opts.displayId} — ${opts.fullName || opts.intake.email || "anonymous"}`,
    html,
    text,
    replyTo: opts.intake.email || undefined
  };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
