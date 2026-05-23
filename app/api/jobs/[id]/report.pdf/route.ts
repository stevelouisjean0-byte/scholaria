import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renderScholarlyReportPDF } from "@/lib/reports/scholarly-review";
import { SAMPLE_FILENAME, SAMPLE_JOB_ID, SAMPLE_MANUSCRIPT, SAMPLE_MEMORY } from "@/lib/reports/sample";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Streams the scholarly review PDF for a given job. Returns the sample
 * deliverable when the job id matches the canonical preview job, so the
 * /preview/sample-report page can render without a DB hit.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let filename: string;
  let manuscript: { wordCount: number; pageCount: number };
  let memory: any;

  if (params.id === SAMPLE_JOB_ID) {
    filename = SAMPLE_FILENAME;
    manuscript = SAMPLE_MANUSCRIPT;
    memory = SAMPLE_MEMORY;
  } else {
    try {
      const { rows } = await db.query(
        `select filename, word_count, upload_meta, memory from jobs where id=$1`,
        [params.id]
      );
      if (!rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });
      filename = rows[0].filename;
      manuscript = {
        wordCount: rows[0].word_count ?? 0,
        pageCount: rows[0].upload_meta?.pageCount ?? 0
      };
      memory = rows[0].memory ?? { jobId: params.id, reviews: {}, updatedAt: new Date().toISOString() };
    } catch (err) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }
  }

  const pdf = await renderScholarlyReportPDF({
    filename,
    jobId: params.id,
    manuscript,
    memory,
    generatedAt: new Date()
  });

  return new NextResponse(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="scholaria-review-${params.id}.pdf"`,
      "Cache-Control": "no-store"
    }
  });
}
