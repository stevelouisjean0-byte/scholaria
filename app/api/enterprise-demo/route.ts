import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENTERPRISE_INBOX =
  process.env.ENTERPRISE_INBOX_ADDRESS ?? "slouisjean@nxaihorizon.com";

/**
 * Enterprise demo request endpoint. Persists the request to the database when
 * available and emails the enterprise inbox. Always returns 200 if the form
 * fields validate so the user gets a confirmation regardless of email
 * provider state — the request is also logged server-side either way.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const institution = String(form.get("institution") ?? "").trim();
  const role = String(form.get("role") ?? "").trim();
  const windows = String(form.get("windows") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();

  if (!name || !email || !institution || !windows) {
    return NextResponse.json(
      { error: "Please provide your name, work email, institution, and three time windows." },
      { status: 400 }
    );
  }
  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid work email." }, { status: 400 });
  }

  const html = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1d2b;line-height:1.55;">
  <div style="border-bottom:1px solid #e5e7eb;padding-bottom:16px;margin-bottom:24px;">
    <div style="font-family:Newsreader,Georgia,serif;font-size:20px;">Enterprise demo request</div>
    <div style="font-size:11px;color:#6b7280;letter-spacing:.18em;text-transform:uppercase;margin-top:4px;">dissertationeditingcenter.com</div>
  </div>
  <table cellpadding="0" cellspacing="0" style="font-size:14px;">
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Name</td><td style="padding:4px 0;">${esc(name)}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;"><a href="mailto:${esc(email)}" style="color:#1a1d2b;">${esc(email)}</a></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Institution</td><td style="padding:4px 0;">${esc(institution)}</td></tr>
    ${role ? `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Role</td><td style="padding:4px 0;">${esc(role)}</td></tr>` : ""}
  </table>
  <h3 style="font-family:Newsreader,Georgia,serif;font-weight:normal;font-size:16px;margin:24px 0 8px;">Suggested time windows</h3>
  <pre style="white-space:pre-wrap;font-family:'JetBrains Mono',Consolas,monospace;font-size:13px;background:#f7f8fa;padding:12px;border-radius:6px;">${esc(windows)}</pre>
  ${notes ? `<h3 style="font-family:Newsreader,Georgia,serif;font-weight:normal;font-size:16px;margin:24px 0 8px;">Notes</h3><pre style="white-space:pre-wrap;font-size:13px;background:#f7f8fa;padding:12px;border-radius:6px;">${esc(notes)}</pre>` : ""}
  <p style="margin-top:28px;font-size:13px;color:#6b7280;">Respond within the published SLA (1 business hour during operating hours).</p>
</body></html>`;

  // Best-effort persist to a leads table; non-fatal if DATABASE_URL missing.
  try {
    const { db } = await import("@/lib/db");
    await db.query(
      `create table if not exists enterprise_leads (
         id bigserial primary key,
         created_at timestamptz default now(),
         name text not null,
         email text not null,
         institution text not null,
         role text,
         windows text,
         notes text,
         user_agent text,
         source_ip text
       )`
    );
    await db.query(
      `insert into enterprise_leads
         (name, email, institution, role, windows, notes, user_agent, source_ip)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        name,
        email,
        institution,
        role,
        windows,
        notes,
        req.headers.get("user-agent") ?? null,
        req.headers.get("x-forwarded-for") ?? null
      ]
    );
  } catch (err) {
    console.warn("[enterprise-demo] persist failed:", err);
  }

  // Best-effort send; no-op if RESEND_API_KEY not configured.
  await sendMail({
    to: ENTERPRISE_INBOX,
    subject: `[demo] ${institution} — ${name}`,
    html,
    replyTo: email
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
