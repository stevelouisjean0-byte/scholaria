import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { getProduct } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_TEST_EMAIL = process.env.OWNER_INBOX_ADDRESS ?? "support@doctoralediting.com";
const TEST_DOCX_BASE64 =
  "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";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await readJson(req);
  const recipientEmail = sanitizeEmail(body.email) ?? DEFAULT_TEST_EMAIL;
  const product = getProduct("dissertation_chapter");
  if (!product) return NextResponse.json({ error: "product_not_found" }, { status: 500 });

  const base = requestBase(req);
  const sessionId = `cs_codex_test_${Date.now()}_${nanoid(8)}`;

  await ensurePurchaseTable();
  await db.query(
    `insert into purchases
       (stripe_session_id, stripe_payment_intent, product_slug, product_name, email, amount_cents, word_cap)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      sessionId,
      `pi_codex_test_${nanoid(10)}`,
      product.slug,
      product.name,
      recipientEmail.toLowerCase(),
      product.priceCents,
      product.wordCap
    ]
  );

  const documentBytes = Buffer.from(TEST_DOCX_BASE64, "base64");
  const form = new FormData();
  form.set("purchaseSessionId", sessionId);
  form.set("firstName", "Codex");
  form.set("lastName", "Workflow Test");
  form.set("email", recipientEmail);
  form.set("university", "Production Test University");
  form.set("degreeProgram", "Ed.D. Organizational Leadership");
  form.set("dissertationStage", "Chapter 2 literature review");
  form.set("chapterUploaded", "Chapter 2");
  form.set("serviceRequested", product.name);
  form.set(
    "notes",
    "No-charge synthetic production test order created by the admin test harness."
  );
  form.set(
    "file",
    new File([documentBytes], "codex-production-test-order.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    })
  );

  const uploadRes = await fetch(new URL("/api/upload", base), {
    method: "POST",
    headers: { "user-agent": "codex-production-test-order/1.0" },
    body: form
  });
  const uploadText = await uploadRes.text();
  const uploadBody = parseJson(uploadText);

  return NextResponse.json(
    {
      ok: uploadRes.ok,
      uploadStatus: uploadRes.status,
      recipientEmail,
      purchaseSessionId: sessionId,
      upload: uploadBody ?? uploadText.slice(0, 1000)
    },
    { status: uploadRes.ok ? 200 : 502 }
  );
}

async function ensurePurchaseTable() {
  await db.query(`
    create table if not exists purchases (
      id bigserial primary key,
      stripe_session_id text unique not null,
      stripe_payment_intent text,
      product_slug text not null,
      product_name text,
      email text not null,
      amount_cents int not null,
      word_cap int,
      created_at timestamptz not null default now(),
      consumed_at timestamptz,
      consumed_job_id text
    )
  `);
  await db.query(`create index if not exists purchases_email_idx on purchases(lower(email))`);
  await db.query(
    `create index if not exists purchases_unconsumed_idx on purchases(email) where consumed_at is null`
  );
}

async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function requestBase(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) throw new Error("Missing host header.");
  return `${proto}://${host}`;
}

function sanitizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return /.+@.+\..+/.test(email) ? email : null;
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
