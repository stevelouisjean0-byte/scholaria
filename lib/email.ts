/**
 * Transactional email — Resend-compatible thin wrapper.
 *
 * No-op when RESEND_API_KEY is not configured, so the upload route never
 * fails because email delivery is misconfigured. The route logs the intent
 * either way so observability is intact.
 */

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_ADDR = process.env.RESEND_FROM_ADDRESS ?? "Dissertation Editing Center <concierge@dissertationeditingcenter.com>";

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
  filename: string;
  wordCount: number;
  planEta?: string;
}): MailInput {
  const eta = opts.planEta ?? "within 24 hours (6–12 hours on Dissertation Intensive)";
  const html = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1d2b; line-height: 1.55;">
  <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
    <div style="font-family: Newsreader, Georgia, serif; font-size: 22px; color: #1a1d2b;">Dissertation Editing Center</div>
    <div style="font-size: 12px; color: #6b7280; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 4px;">Review confirmation</div>
  </div>

  <p>Your manuscript has been received and the review is underway.</p>

  <table cellpadding="0" cellspacing="0" style="margin: 18px 0; font-size: 14px;">
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Confirmation ID</td><td style="font-family: 'JetBrains Mono', Consolas, monospace; padding: 4px 0;">${opts.jobId}</td></tr>
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Manuscript</td><td style="padding: 4px 0;">${escape(opts.filename)}</td></tr>
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Word count</td><td style="padding: 4px 0;">${opts.wordCount.toLocaleString()}</td></tr>
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">Estimated turnaround</td><td style="padding: 4px 0;">${eta}</td></tr>
  </table>

  <p style="margin-top: 24px;">We'll email you the moment your annotated PDF, APA report, and prioritized revision plan are ready.</p>

  <p style="margin: 28px 0;">
    <a href="${BASE}/status/${opts.jobId}" style="display: inline-block; background: #1a1d2b; color: #fff; padding: 10px 18px; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 14px;">Track your review →</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

  <p style="font-size: 13px; color: #6b7280;">
    Questions? Reply to this email or write to <a href="mailto:concierge@dissertationeditingcenter.com" style="color: #1a1d2b;">concierge@dissertationeditingcenter.com</a>.<br />
    14-day money-back guarantee · Cancel anytime
  </p>
</body></html>`;

  const text = [
    "Dissertation Editing Center — Review confirmation",
    "",
    "Your manuscript has been received and the review is underway.",
    "",
    `Confirmation ID:   ${opts.jobId}`,
    `Manuscript:        ${opts.filename}`,
    `Word count:        ${opts.wordCount.toLocaleString()}`,
    `Estimated time:    ${eta}`,
    "",
    `Track your review: ${BASE}/status/${opts.jobId}`,
    "",
    "We'll email you the moment your annotated PDF, APA report, and prioritized revision plan are ready.",
    "",
    "Questions? Reply to this email or write to concierge@dissertationeditingcenter.com.",
    "14-day money-back guarantee. Cancel anytime."
  ].join("\n");

  return {
    to: opts.to,
    subject: `Your dissertation review is underway — ${opts.jobId}`,
    html,
    text,
    replyTo: "concierge@dissertationeditingcenter.com"
  };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
