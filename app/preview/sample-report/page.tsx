import { SAMPLE_FILENAME, SAMPLE_JOB_ID, SAMPLE_MEMORY } from "@/lib/reports/sample";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sample deliverable — preview the report",
  description:
    "Preview an example of the editorial review report Scholaria delivers to doctoral and graduate students.",
  alternates: { canonical: "/preview/sample-report" },
  robots: { index: false, follow: true }
};

export default function SampleReport() {
  const findings = Object.values(SAMPLE_MEMORY.reviews ?? {})
    .filter(Boolean)
    .flatMap((r) => r!.findings);

  return (
    <>
      <PageMasthead
        number="Preview"
        eyebrow="Sample deliverable"
        title="A preview of the editorial review report a client receives."
        dek="Generated from a representative Ed.D. methodology chapter. The PDF below is produced by the same generator that runs after a real review completes."
        photo={PAGE_HEROES.howItWorks}
      />

      <section className="section">
        <div className="container grid grid-cols-12 gap-10">
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div>
              <div className="eyebrow">Manuscript</div>
              <p className="mt-2 text-[14.5px] text-ink-900">{SAMPLE_FILENAME}</p>
            </div>
            <div>
              <div className="eyebrow">Reviewing agents</div>
              <ul className="mt-2 space-y-1 text-[13.5px] text-ink-700">
                <li>· Professional Editor Agent</li>
                <li>· Research Support Agent</li>
                <li>· QA &amp; Final Approval Agent</li>
              </ul>
            </div>
            <div>
              <div className="eyebrow">Findings by severity</div>
              <ul className="mt-2 space-y-1 text-[13.5px] text-ink-700">
                <li>
                  · Major ·{" "}
                  <span className="tabular text-ink-900">
                    {findings.filter((f) => f.severity === "major").length}
                  </span>
                </li>
                <li>
                  · Moderate ·{" "}
                  <span className="tabular text-ink-900">
                    {findings.filter((f) => f.severity === "moderate").length}
                  </span>
                </li>
                <li>
                  · Minor ·{" "}
                  <span className="tabular text-ink-900">
                    {findings.filter((f) => f.severity === "minor").length}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <div className="eyebrow">Submission readiness</div>
              <p className="mt-2 font-serif text-4xl tabular text-ink-900">
                {SAMPLE_MEMORY.qa?.submissionReadiness ?? "—"}
                <span className="text-ink-400 text-lg">/100</span>
              </p>
            </div>
            <div className="pt-4 border-t border-ink-200">
              <a
                href={`/api/jobs/${SAMPLE_JOB_ID}/report.pdf`}
                target="_blank"
                rel="noopener"
                className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2 text-[14.5px]"
              >
                Open the report PDF in a new tab →
              </a>
              <p className="mt-2 text-[12px] text-ink-500 italic">
                The same generator that runs in production. No real agents were invoked for this preview.
              </p>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-8">
            <object
              data={`/api/jobs/${SAMPLE_JOB_ID}/report.pdf`}
              type="application/pdf"
              className="w-full h-[88vh] ring-1 ring-ink-200"
            >
              <p className="p-6 text-[14.5px] text-ink-700">
                Your browser does not display PDFs inline. {" "}
                <a
                  className="text-ink-900 underline underline-offset-[6px]"
                  href={`/api/jobs/${SAMPLE_JOB_ID}/report.pdf`}
                >
                  Open the PDF directly →
                </a>
              </p>
            </object>
          </div>
        </div>
      </section>
    </>
  );
}
