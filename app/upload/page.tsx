import { UploadZone } from "@/components/upload-zone";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload your paper",
  description: "Upload a dissertation, literature review, capstone, or graduate paper for autonomous validation by Scholaria's Agentic AI Agents.",
  alternates: { canonical: "/upload" }
};

export default function UploadPage() {
  return (
    <>
      <PageMasthead
        number="IV"
        eyebrow="Submission desk"
        title="Send your manuscript to the operating system."
        dek="The Lead Intake Agent activates the moment your file arrives. Within seconds, the routing layer assigns your manuscript to the correct validation track and the reviewing Agentic AI Agents begin coordinated execution."
        photo={PAGE_HEROES.upload}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <UploadZone />
          </div>
          <aside className="lg:col-span-5 space-y-6">
            <div>
              <div className="eyebrow">What happens next</div>
              <ol className="mt-4 space-y-3 text-[14px] text-ink-700 list-decimal pl-5 border-l border-ink-200 ml-2 pl-6">
                <li>Lead Intake captures degree level, paper type, deadline, formatting style, and concerns.</li>
                <li>Project Scoping &amp; Routing scores complexity and selects the validation track.</li>
                <li>Reviewing Agentic AI Agents post explicit findings into a shared memory document.</li>
                <li>QA &amp; Final Approval performs intelligent multi-step verification and scores submission readiness.</li>
                <li>You receive an annotated document, an APA report, and a prioritised revision plan.</li>
              </ol>
            </div>
            <div className="pt-6 border-t border-ink-200">
              <div className="eyebrow">What we will not do</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-700">
                Scholaria validates, edits, and guides scholarly writing. It will not author your
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
