import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { enqueueIntake } from "@/lib/orchestrator";
import { parseDocument } from "@/lib/document";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  // Extract text up front so the agents see real content immediately.
  // If parsing fails (corrupt file, scanned image PDF, etc.) we still
  // accept the upload — the orchestrator will surface that gracefully.
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

  await enqueueIntake(jobId);

  return NextResponse.json({
    jobId,
    stage: "uploaded",
    document: {
      kind: parsed.kind,
      wordCount: parsed.wordCount,
      pageCount: parsed.pageCount,
      excerpt: parsed.excerpt.slice(0, 280)
    },
    message:
      "Manuscript received and parsed. The Lead Intake Agent has been engaged and the autonomous review pipeline is starting."
  });
}
