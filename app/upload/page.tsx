import { UploadZone } from "@/components/upload-zone";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload your chapter — free first review",
  description: "Drop a chapter (PDF or DOCX) and get an annotated review, APA report, and submission-readiness score in 24 hours. No credit card. 14-day money-back guarantee.",
  alternates: { canonical: "/upload" }
};

export default function UploadPage() {
  return (
    <>
      <PageMasthead
        number="IV"
        eyebrow="Upload"
        title="Upload a chapter — get an annotated review in 24 hours."
        dek="PDF or DOCX. The first review is free, no credit card. Methodology alignment, APA 7 verification, citation cross-check, and a 0–100 readiness score — delivered by email."
        photo={PAGE_HEROES.upload}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            {/* Three-pill reassurance row above the file picker */}
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <a href="/sample-review" className="rounded-lg bg-paper ring-1 ring-ink-200 px-3 py-2.5 hover:ring-ink-400 transition group">
                <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">See first</div>
                <div className="mt-0.5 text-ink-900 font-medium group-hover:underline underline-offset-4">
                  Sample annotated review →
                </div>
              </a>
              <div className="rounded-lg bg-paper ring-1 ring-ink-200 px-3 py-2.5">
                <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">Security</div>
                <div className="mt-0.5 text-ink-900 font-medium">FERPA-aware · AES-256</div>
              </div>
              <div className="rounded-lg bg-paper ring-1 ring-ink-200 px-3 py-2.5">
                <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">Refund</div>
                <div className="mt-0.5 text-ink-900 font-medium">14-day money back</div>
              </div>
            </div>

            <UploadZone />

            <p className="text-[12px] text-ink-500 text-center">
              Most chapters return within 24 hours · 6–12 hours on Dissertation Intensive
            </p>
          </div>
          <aside className="lg:col-span-5 space-y-6">
            <div>
              <div className="eyebrow">What happens next</div>
              <ol className="mt-4 space-y-3 text-[14px] text-ink-700 list-decimal pl-5 border-l border-ink-200 ml-2 pl-6">
                <li>You'll receive a confirmation email within 60 seconds with your review ID.</li>
                <li>The editor agent runs methodology, tone, and structure passes (~12 minutes).</li>
                <li>The research agent verifies citations and synthesis depth.</li>
                <li>QA validates every finding and scores submission readiness 0–100.</li>
                <li>You receive an email with the annotated PDF, APA report, and prioritised revision plan.</li>
              </ol>
            </div>
            <div className="pt-6 border-t border-ink-200">
              <div className="eyebrow">What we will not do</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-700">
                We validate, edit, and guide scholarly writing. We will not author your
                dissertation, assignment, or capstone on your behalf. Academic integrity is a
                first-class architectural constraint.
              </p>
            </div>
            <div className="pt-6 border-t border-ink-200">
              <div className="eyebrow">Security</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-700">
                Uploads are encrypted in transit and at rest. Files are retained only for the period your plan
                allows. Enterprise customers configure retention at the institution level.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
