import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Debug endpoint — directly probes Resend's API to surface the actual error
 * the production sendMail helper is hitting. No fire-and-forget, no swallowed
 * errors. Returns the raw status + body so we can see exactly what's wrong.
 *
 * Auth: requires the same CRON_SECRET as the cron tick endpoint (or open if
 * CRON_SECRET is unset). Never exposes the API key itself.
 *
 * Usage:
 *   curl "https://dissertationeditingcenter.com/api/debug/email?to=slouisjean@yahoo.com"
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") ?? "slouisjean@yahoo.com";
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_ADDRESS;
  const ownerAddr = process.env.OWNER_INBOX_ADDRESS;

  const envSnapshot = {
    RESEND_API_KEY_present: Boolean(key),
    RESEND_API_KEY_length: key?.length ?? 0,
    RESEND_API_KEY_prefix: key ? key.slice(0, 7) + "…" : null,
    RESEND_API_KEY_has_whitespace: key ? /\s/.test(key) : null,
    RESEND_FROM_ADDRESS: from ?? null,
    OWNER_INBOX_ADDRESS: ownerAddr ?? null
  };

  if (!key) {
    return NextResponse.json({
      ok: false,
      stage: "env-check",
      error: "RESEND_API_KEY not set on this deploy",
      env: envSnapshot
    });
  }

  // Direct probe — no helpers, no fire-and-forget.
  let probeStatus = 0;
  let probeBody: any = null;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: from ?? "Dissertation Editing Center <onboarding@resend.dev>",
        to,
        subject: "DEC debug ping",
        html: "<p>If you receive this, Resend is wired correctly.</p>",
        text: "If you receive this, Resend is wired correctly."
      })
    });
    probeStatus = res.status;
    const text = await res.text();
    try {
      probeBody = JSON.parse(text);
    } catch {
      probeBody = { _raw: text.slice(0, 500) };
    }
  } catch (err) {
    return NextResponse.json({
      ok: false,
      stage: "network",
      error: err instanceof Error ? err.message : String(err),
      env: envSnapshot
    });
  }

  return NextResponse.json({
    ok: probeStatus >= 200 && probeStatus < 300,
    stage: "resend-api",
    probeStatus,
    probeBody,
    env: envSnapshot
  });
}
