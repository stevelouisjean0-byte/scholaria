import { NextResponse } from "next/server";
import { renderScholarlyReportPDF } from "@/lib/reports/scholarly-review";
import {
  SAMPLE_FILENAME,
  SAMPLE_JOB_ID,
  SAMPLE_MANUSCRIPT,
  SAMPLE_MEMORY
} from "@/lib/reports/sample";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 86400;

/**
 * Server-rendered sample review PDF — what the /sample-review page links to.
 * Generated on the fly from the canonical fixture so the file always reflects
 * the latest sample memory data without committing a binary to the repo.
 */
export async function GET() {
  const pdfBytes = await renderScholarlyReportPDF({
    jobId: SAMPLE_JOB_ID,
    filename: SAMPLE_FILENAME,
    manuscript: SAMPLE_MANUSCRIPT,
    memory: SAMPLE_MEMORY,
    generatedAt: new Date("2026-01-15T12:00:00Z")
  });

  return new NextResponse(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="dec-sample-review.pdf"',
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
}
