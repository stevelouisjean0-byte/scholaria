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
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let filename: string;
  let manuscript: { wordCount: number; pageCount: number };
  let memory: any;
  let displayIdExt: string | undefined;
  let clientNameExt: string | undefined;
  let serviceExt: string | undefined;

  if (params.id === SAMPLE_JOB_ID) {
    // Public sample report — anyone may download it.
    filename = SAMPLE_FILENAME;
    manuscript = SAMPLE_MANUSCRIPT;
    memory = SAMPLE_MEMORY;
  } else {
    // Real-job PDF contains PII (manuscript content + scores). Authorize:
    //   - Admin → any job
    //   - Otherwise → must be the Clerk user who owns the job
    let isAdmin = false;
    let viewerClerkId: string | null = null;
    try {
      const { requireAdmin } = await import("@/lib/admin");
      isAdmin = Boolean(await requireAdmin());
    } catch { /* fall through */ }
    if (!isAdmin) {
      try {
        const { clerkEnabled } = await import("@/lib/clerk-config");
        if (clerkEnabled) {
          const { auth } = await import("@clerk/nextjs/server");
          const a = await auth();
          viewerClerkId = a.userId ?? null;
        }
      } catch { /* no viewer id */ }
    }

    try {
      const { rows } = await db.query(
        `select user_id, filename, word_count, upload_meta, memory, display_id from jobs where id=$1`,
        [params.id]
      );
      if (!rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });

      const providedToken = req.nextUrl.searchParams.get("token");
      const deliveryToken =
        typeof rows[0].upload_meta?.deliveryToken === "string"
          ? rows[0].upload_meta.deliveryToken
          : undefined;
      const tokenOk = Boolean(deliveryToken && providedToken && providedToken === deliveryToken);

      // Owner check. Anonymous paid uploads are delivered through a private
      // per-job tokenized email link because they do not have a Clerk owner.
      if (!isAdmin && !tokenOk && (!viewerClerkId || rows[0].user_id !== viewerClerkId)) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }

      filename = rows[0].filename;
      manuscript = {
        wordCount: rows[0].word_count ?? 0,
        pageCount: rows[0].upload_meta?.pageCount ?? 0
      };
      memory = rows[0].memory ?? { jobId: params.id, reviews: {}, updatedAt: new Date().toISOString() };
      displayIdExt = rows[0].display_id ?? undefined;
      const intakeExt = (rows[0].upload_meta?.intake ?? {}) as Record<string, any>;
      clientNameExt =
        [intakeExt.firstName, intakeExt.lastName].filter(Boolean).join(" ").trim() || undefined;
      serviceExt = intakeExt.serviceRequested ?? undefined;
    } catch (err) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }
  }

  const pdf = await renderScholarlyReportPDF({
    filename,
    jobId: params.id,
    manuscript,
    memory,
    generatedAt: new Date(),
    displayId: displayIdExt,
    clientName: clientNameExt,
    servicePurchased: serviceExt
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
