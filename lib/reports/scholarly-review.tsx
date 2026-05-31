/**
 * Scholarly Review — PDF report generator (v2).
 *
 * Renders the 18-section formal client deliverable when the job memory has a
 * v2 `formalReport` block. Falls back to a compact legacy layout for jobs
 * whose memory predates the v2 schema.
 *
 * Sections rendered (v2):
 *   1.  Cover Page
 *   2.  Submission Details
 *   3.  Executive Summary
 *   4.  Score Overview (with the 9 canonical category scores, each explained)
 *   5.  Readiness Score Explanation
 *   6.  Quality Assurance Review
 *   7.  Major Strengths
 *   8.  Priority Revision Findings
 *   9.  APA 7 Compliance Review
 *   10. Citation and Reference Integrity Review
 *   11. Literature Review and Synthesis Review
 *   12. Theoretical or Conceptual Framework Review
 *   13. Research Alignment Review
 *   14. Scholarly Tone and Writing Quality Review
 *   15. Detailed Revision Plan
 *   16. Final Recommendation
 *   17. Agent Activity Confirmation
 *   18. Support and Next Steps
 *
 * Server-only. Never import from a client component.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer
} from "@react-pdf/renderer";
import type { JobMemory, ReviewFinding, FormalReport } from "@/lib/memory";

const ink = {
  900: "#0b0e16",
  800: "#171b27",
  700: "#272d3c",
  600: "#3d4557",
  500: "#5b6478",
  400: "#8a94a7",
  300: "#b9c1d0",
  200: "#dadfe8",
  100: "#eef0f4",
  50: "#f7f8fa"
};

const s = StyleSheet.create({
  page: { padding: 56, fontFamily: "Helvetica", fontSize: 10.5, color: ink[800], lineHeight: 1.55 },
  imprint: { fontSize: 8.5, color: ink[500], letterSpacing: 1.6, textTransform: "uppercase" },
  rule: { borderBottomWidth: 1, borderBottomColor: ink[900], marginTop: 8, marginBottom: 24 },
  hair: { borderBottomWidth: 0.5, borderBottomColor: ink[200], marginTop: 10, marginBottom: 12 },
  title: { fontFamily: "Times-Roman", fontSize: 30, color: ink[900], lineHeight: 1.12, letterSpacing: -0.3 },
  dek: { fontFamily: "Times-Roman", fontStyle: "italic", fontSize: 13, color: ink[600], lineHeight: 1.45, marginTop: 10 },
  chapter: { fontSize: 9, color: ink[500], letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, marginTop: 18 },
  h2: { fontFamily: "Times-Roman", fontSize: 18, color: ink[900], marginTop: 2, marginBottom: 10 },
  h3: { fontFamily: "Times-Roman", fontSize: 13, color: ink[900], marginBottom: 4, marginTop: 12 },
  h4: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: ink[900], marginBottom: 3, marginTop: 8 },
  body: { fontSize: 10.5, color: ink[700], lineHeight: 1.6, marginBottom: 8 },
  bodyTight: { fontSize: 10, color: ink[700], lineHeight: 1.5, marginBottom: 4 },
  small: { fontSize: 8.5, color: ink[500] },
  metaRow: { flexDirection: "row", marginBottom: 4 },
  metaKey: { fontSize: 9, color: ink[500], width: 150 },
  metaVal: { fontSize: 10, color: ink[800], flex: 1 },
  card: { borderWidth: 0.5, borderColor: ink[200], borderRadius: 2, padding: 12, marginBottom: 10 },
  cardHeading: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: ink[900], marginBottom: 4 },
  cardBody: { fontSize: 10, color: ink[700], lineHeight: 1.55, marginBottom: 4 },
  cardLabel: { fontSize: 8.5, color: ink[500], letterSpacing: 1.2, textTransform: "uppercase", marginTop: 5 },
  excerpt: { fontFamily: "Times-Roman", fontStyle: "italic", fontSize: 10, color: ink[900], borderLeftWidth: 1, borderLeftColor: ink[300], paddingLeft: 8, marginVertical: 4 },
  pageFooter: { position: "absolute", left: 56, right: 56, bottom: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: ink[400], borderTopWidth: 0.5, borderTopColor: ink[200], paddingTop: 8 },
  scoreCardRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: ink[200], paddingVertical: 8 },
  scoreCategory: { flex: 1 },
  scoreCategoryName: { fontFamily: "Helvetica-Bold", fontSize: 10, color: ink[900] },
  scoreCategoryDetail: { fontSize: 9.5, color: ink[700], marginTop: 2, lineHeight: 1.45 },
  scoreCategoryValue: { fontFamily: "Times-Roman", fontSize: 16, color: ink[900], marginLeft: 12, width: 60, textAlign: "right" },
  severityPill: {
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
    color: "#fff"
  },
  agentRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: ink[200]
  }
});

export interface ReportInput {
  filename: string;
  jobId: string;
  manuscript: { wordCount: number; pageCount: number };
  memory: JobMemory;
  generatedAt: Date;
  displayId?: string;
  clientName?: string;
  servicePurchased?: string;
}

export async function renderScholarlyReportPDF(input: ReportInput): Promise<Uint8Array> {
  const buffer = await renderToBuffer(<ScholarlyReview {...input} />);
  return buffer;
}

function isFormalReportV2(report: any): report is FormalReport {
  return Boolean(
    report &&
      typeof report === "object" &&
      report.scoreOverview && // v2-only
      report.agentActivity     // v2-only
  );
}

function ScholarlyReview(input: ReportInput) {
  const { memory } = input;
  if (memory.formalReport && isFormalReportV2(memory.formalReport)) {
    return <FormalReviewDocumentV2 {...input} formal={memory.formalReport} />;
  }
  return <LegacyReviewDocument {...input} />;
}

// ============================================================
// Formal v2 — 18-section report (new pipeline)
// ============================================================

function FormalReviewDocumentV2(input: ReportInput & { formal: FormalReport }) {
  const { filename, jobId, manuscript, memory, generatedAt, displayId, clientName, formal } = input;
  const qa = memory.qa;
  const cover = formal.cover;
  const sub = formal.submissionDetails;
  const display = displayId ?? cover.submissionId ?? jobId;

  return (
    <Document
      title={`Dissertation Editing Center · Review of ${filename}`}
      author="Dissertation Editing Center"
      subject="Scholarly review report"
      creator="Dissertation Editing Center"
    >
      {/* Page 1 — Cover */}
      <Page size="LETTER" style={s.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.imprint}>Dissertation Editing Center</Text>
          <Text style={s.imprint}>{monthOf(generatedAt)}</Text>
        </View>
        <View style={s.rule} />

        <Text style={s.imprint}>I. Scholarly Review Report</Text>
        <Text style={s.title}>{cover.documentTitle ?? deriveTitle(filename)}</Text>
        <Text style={s.dek}>
          A formal scholarly review of the submitted manuscript, prepared by the multi-agent
          editorial ecosystem and validated by the Quality Assurance &amp; Final Approval Agent.
        </Text>

        <View style={s.hair} />

        {/* Cover-page metadata */}
        <View style={{ marginTop: 6 }}>
          {(cover.studentName ?? clientName) && (
            <MetaRow k="Student name" v={cover.studentName ?? clientName ?? ""} />
          )}
          <MetaRow k="Document title" v={cover.documentTitle ?? filename} />
          <MetaRow k="Service purchased" v={cover.servicePurchased ?? "Scholarly Review"} />
          <MetaRow k="Submission ID" v={display} />
          <MetaRow k="Internal job ID" v={jobId} mono />
          <MetaRow k="File reviewed" v={filename} />
          {(cover.wordCount ?? manuscript.wordCount) > 0 && (
            <MetaRow k="Word count" v={(cover.wordCount ?? manuscript.wordCount).toLocaleString()} />
          )}
          <MetaRow
            k="Date completed"
            v={cover.completedAt ? cover.completedAt.slice(0, 10) : generatedAt.toISOString().slice(0, 10)}
          />
          {qa && <MetaRow k="Submission readiness" v={`${qa.submissionReadiness} / 100`} />}
          {qa && <MetaRow k="Quality assurance score" v={`${qa.qualityScore} / 100`} />}
        </View>

        {/* Section 2: Submission Details */}
        <Text style={s.chapter}>II. Submission Details</Text>
        <View>
          {sub.chapterUploaded && <MetaRow k="Chapter uploaded" v={sub.chapterUploaded} />}
          {sub.degreeProgram && <MetaRow k="Degree program" v={sub.degreeProgram} />}
          {sub.dissertationStage && <MetaRow k="Dissertation stage" v={sub.dissertationStage} />}
          {sub.university && <MetaRow k="Institution" v={sub.university} />}
          {sub.deadline && <MetaRow k="Stated deadline" v={String(sub.deadline).slice(0, 10)} />}
          {sub.professorFeedback && (
            <View style={{ marginTop: 6 }}>
              <Text style={s.metaKey}>Notes from client</Text>
              <Text style={{ ...s.body, marginTop: 2 }}>{sub.professorFeedback}</Text>
            </View>
          )}
          {sub.areasOfConcern && sub.areasOfConcern.length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={s.metaKey}>Areas of concern</Text>
              <Text style={{ ...s.body, marginTop: 2 }}>{sub.areasOfConcern.join("; ")}</Text>
            </View>
          )}
        </View>

        <Footer page={1} jobId={display} />
      </Page>

      {/* Page 2 — Executive Summary */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>III. Executive Summary</Text>
        <Paragraphs text={formal.executiveSummary} />

        <Footer page={2} jobId={display} />
      </Page>

      {/* Page 3 — Score Overview + Readiness/Quality explanations */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>IV. Score Overview</Text>
        <View style={{ marginTop: 4 }}>
          {(formal.scoreOverview?.categories ?? []).map((c, i) => (
            <View key={i} style={s.scoreCardRow}>
              <View style={s.scoreCategory}>
                <Text style={s.scoreCategoryName}>{c.name}</Text>
                <Text style={s.scoreCategoryDetail}>{c.reason}</Text>
                {c.evidence && (
                  <Text style={{ ...s.scoreCategoryDetail, fontStyle: "italic", color: ink[600], marginTop: 2 }}>
                    Evidence: {c.evidence}
                  </Text>
                )}
                <Text style={{ ...s.scoreCategoryDetail, marginTop: 3 }}>
                  <Text style={{ color: ink[900], fontFamily: "Helvetica-Bold" }}>Recommendation. </Text>
                  {c.recommendation}
                </Text>
              </View>
              <Text style={s.scoreCategoryValue}>{c.score} / 100</Text>
            </View>
          ))}
        </View>

        <Text style={s.chapter}>V. Readiness Score Explanation</Text>
        <Paragraphs text={formal.scoreOverview?.submissionReadiness?.explanation} />

        <Text style={s.chapter}>VI. Quality Assurance Review</Text>
        <Paragraphs text={formal.scoreOverview?.overallQuality?.explanation} />
        {formal.qaReview && (
          <View style={{ marginTop: 4 }}>
            <Text style={s.h4}>QA notes</Text>
            <Paragraphs text={formal.qaReview} />
          </View>
        )}

        <Footer page={3} jobId={display} />
      </Page>

      {/* Page 4 — Major Strengths */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>VII. Major Strengths</Text>
        {formal.majorStrengths.length === 0 ? (
          <Text style={s.body}>No specific strengths were identified by the reviewing agents.</Text>
        ) : (
          formal.majorStrengths.map((st, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardHeading}>{i + 1}. {st.heading}</Text>
              <Text style={s.cardBody}>{st.explanation}</Text>
              {st.evidence && (
                <>
                  <Text style={s.cardLabel}>Evidence</Text>
                  <Text style={s.excerpt}>{st.evidence}</Text>
                </>
              )}
              <Text style={s.cardLabel}>Why it matters academically</Text>
              <Text style={s.cardBody}>{st.academicSignificance}</Text>
            </View>
          ))
        )}

        <Footer page={4} jobId={display} />
      </Page>

      {/* Page 5 — Priority Revisions */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>VIII. Priority Revision Findings</Text>
        <Text style={s.body}>
          The revisions below are ordered by their impact on a stronger submission. Each finding
          identifies the issue, why it matters, where it appears, and how to address it.
        </Text>
        {formal.priorityRevisions.length === 0 ? (
          <Text style={s.body}>No priority revisions were recorded.</Text>
        ) : (
          formal.priorityRevisions.map((r, i) => (
            <View key={i} style={s.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <Text style={s.cardHeading}>Finding {r.findingNumber || i + 1}. {r.issue}</Text>
                <SeverityPill severity={r.severity} />
              </View>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 4 }}>
                {r.category && <Text style={s.small}>Category: {r.category}</Text>}
                {r.location && <Text style={s.small}>Location: {r.location}</Text>}
                {r.relatedStandard && <Text style={s.small}>Standard: {r.relatedStandard}</Text>}
              </View>
              {r.excerpt && (
                <>
                  <Text style={s.cardLabel}>Excerpt</Text>
                  <Text style={s.excerpt}>{r.excerpt}</Text>
                </>
              )}
              <Text style={s.cardLabel}>Why it matters</Text>
              <Text style={s.cardBody}>{r.whyItMatters}</Text>
              <Text style={s.cardLabel}>Recommended fix</Text>
              <Text style={s.cardBody}>{r.recommendedFix}</Text>
              {r.exampleRevision && (
                <>
                  <Text style={s.cardLabel}>Example revision</Text>
                  <Text style={s.excerpt}>{r.exampleRevision}</Text>
                </>
              )}
            </View>
          ))
        )}

        <Footer page={5} jobId={display} />
      </Page>

      {/* Page 6 — APA 7 Compliance + Citation Integrity */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>IX. APA 7 Compliance Review</Text>
        <Paragraphs text={formal.apaReview?.overall} />
        {(formal.apaReview?.areas ?? []).map((a, i) => (
          <View key={i} style={s.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardHeading}>{a.area}</Text>
              <Text style={s.small}>{a.status}</Text>
            </View>
            <Text style={s.cardLabel}>Finding</Text>
            <Text style={s.cardBody}>{a.finding}</Text>
            <Text style={s.cardLabel}>Recommendation</Text>
            <Text style={s.cardBody}>{a.recommendation}</Text>
          </View>
        ))}

        <Text style={s.chapter}>X. Citation &amp; Reference Integrity Review</Text>
        <Paragraphs text={formal.citationIntegrity?.overall} />
        {formal.citationIntegrity?.verificationDisclaimer && (
          <View style={{ ...s.card, backgroundColor: ink[50] }}>
            <Text style={s.cardLabel}>Verification advisory</Text>
            <Text style={s.cardBody}>{formal.citationIntegrity.verificationDisclaimer}</Text>
          </View>
        )}
        <ListBlock title="Sources flagged for client verification" items={formal.citationIntegrity?.requiresVerification ?? []} />
        <ListBlock title="Citations in text that appear absent from the reference list" items={formal.citationIntegrity?.missingFromReferences ?? []} />
        <ListBlock title="Reference-list entries not cited in the body" items={formal.citationIntegrity?.uncitedInBody ?? []} />
        {formal.citationIntegrity?.notes && (
          <>
            <Text style={s.h4}>Notes</Text>
            <Paragraphs text={formal.citationIntegrity.notes} />
          </>
        )}

        <Footer page={6} jobId={display} />
      </Page>

      {/* Page 7 — Literature + Framework + Alignment */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>XI. Literature Review and Synthesis Review</Text>
        <Paragraphs text={formal.literatureReview?.overall} />
        <Text style={s.h4}>Organization</Text>
        <Paragraphs text={formal.literatureReview?.organization} />
        <Text style={s.h4}>Synthesis</Text>
        <Paragraphs text={formal.literatureReview?.synthesis} />
        <Text style={s.h4}>Theme development</Text>
        <Paragraphs text={formal.literatureReview?.themes} />
        <Text style={s.h4}>Gap articulation</Text>
        <Paragraphs text={formal.literatureReview?.gapArticulation} />

        <Text style={s.chapter}>XII. Theoretical / Conceptual Framework Review</Text>
        {formal.theoreticalFramework?.frameworkIdentified && (
          <Text style={s.body}>
            <Text style={{ color: ink[900], fontFamily: "Helvetica-Bold" }}>Framework identified. </Text>
            {formal.theoreticalFramework.frameworkIdentified}
          </Text>
        )}
        <Paragraphs text={formal.theoreticalFramework?.overall} />
        <Text style={s.h4}>Integration through the chapter</Text>
        <Paragraphs text={formal.theoreticalFramework?.integration} />
        <Text style={s.h4}>Operationalization for the study</Text>
        <Paragraphs text={formal.theoreticalFramework?.operationalization} />

        <Footer page={7} jobId={display} />
      </Page>

      {/* Page 8 — Alignment + Chapter-specific */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>XIII. Research Alignment Review</Text>
        <Paragraphs text={formal.alignmentReview?.overall} />
        {(formal.alignmentReview?.elements ?? []).map((el, i) => (
          <View key={i} style={s.card}>
            <Text style={s.cardHeading}>{el.element}</Text>
            <Text style={s.cardBody}>{el.assessment}</Text>
          </View>
        ))}

        <Text style={s.chapter}>XIV. {formal.chapterSpecificReview?.sectionType ?? "Section"} Review</Text>
        {(formal.chapterSpecificReview?.sections ?? []).length === 0 ? (
          <Text style={s.body}>No section-specific findings were recorded.</Text>
        ) : (
          (formal.chapterSpecificReview?.sections ?? []).map((sec, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardHeading}>{sec.topic}</Text>
              <Text style={s.cardLabel}>Finding</Text>
              <Text style={s.cardBody}>{sec.finding}</Text>
              <Text style={s.cardLabel}>Recommendation</Text>
              <Text style={s.cardBody}>{sec.recommendation}</Text>
            </View>
          ))
        )}

        <Footer page={8} jobId={display} />
      </Page>

      {/* Page 9 — Scholarly Tone + Revision Plan + Final Recommendation */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>XV. Scholarly Tone &amp; Writing Quality Review</Text>
        <Paragraphs text={formal.scholarlyTone?.overall} />
        <ListBlock title="Observations" items={formal.scholarlyTone?.observations ?? []} />
        {(formal.scholarlyTone?.suggestedEdits ?? []).length > 0 && (
          <>
            <Text style={s.h4}>Suggested edits</Text>
            {(formal.scholarlyTone?.suggestedEdits ?? []).map((e, i) => (
              <View key={i} style={s.card}>
                <Text style={s.cardLabel}>From</Text>
                <Text style={s.excerpt}>{e.excerpt}</Text>
                <Text style={s.cardLabel}>To</Text>
                <Text style={s.excerpt}>{e.revised}</Text>
                <Text style={s.cardLabel}>Why</Text>
                <Text style={s.cardBody}>{e.rationale}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={s.chapter}>XVI. Detailed Revision Plan</Text>
        <PhaseBlock title="Immediate revisions" items={formal.revisionPlan?.immediate ?? []} />
        <PhaseBlock title="High-impact revisions" items={formal.revisionPlan?.highImpact ?? []} />
        <PhaseBlock title="Final polish" items={formal.revisionPlan?.finalPolish ?? []} />

        <Text style={s.chapter}>XVII. Final Recommendation</Text>
        <Paragraphs text={formal.finalRecommendation} />

        <Footer page={9} jobId={display} />
      </Page>

      {/* Page 10 — Agent Activity + Support */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>XVIII. Agent Activity Confirmation</Text>
        <Text style={s.body}>
          The autonomous editorial ecosystem invokes each of the agents below for every paid review.
          The status of each agent for this submission is recorded for client transparency.
        </Text>
        <View style={{ marginTop: 8 }}>
          {(formal.agentActivity ?? []).map((a, i) => (
            <View key={i} style={s.agentRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...s.cardBody, fontFamily: "Helvetica-Bold", marginBottom: 1 }}>{a.agentName}</Text>
                <Text style={{ ...s.cardBody, color: ink[600], fontSize: 9.5 }}>{a.reviewArea}</Text>
                {a.note && <Text style={{ ...s.small, marginTop: 2, fontStyle: "italic" }}>{a.note}</Text>}
              </View>
              <View style={{ width: 100, alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Helvetica-Bold",
                    color: a.status === "completed" ? "#0a7d3b" : a.status === "not_applicable" ? ink[500] : "#a04500"
                  }}
                >
                  {a.status === "completed" ? "Completed" : a.status === "not_applicable" ? "Not applicable" : "Did not run"}
                </Text>
                <Text style={{ ...s.small, marginTop: 2 }}>
                  {a.findingsIncluded ? "Findings included" : "—"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.chapter}>Support and Next Steps</Text>
        <Paragraphs text={formal.supportAndNextSteps?.note} />
        <View style={{ marginTop: 6 }}>
          <MetaRow k="Contact" v={formal.supportAndNextSteps?.contactEmail ?? "support@doctoralediting.com"} />
          <MetaRow k="Status URL" v={formal.supportAndNextSteps?.statusUrl ?? ""} />
          <MetaRow k="PDF (downloadable)" v={formal.supportAndNextSteps?.pdfUrl ?? ""} />
        </View>

        <Footer page={10} jobId={display} />
      </Page>
    </Document>
  );
}

function SeverityPill({ severity }: { severity: "high" | "moderate" | "minor" }) {
  const color =
    severity === "high" ? "#9b1c2b" : severity === "moderate" ? "#a04500" : ink[500];
  return (
    <Text style={{ ...s.severityPill, backgroundColor: color }}>
      {severity.toUpperCase()}
    </Text>
  );
}

function Paragraphs({ text }: { text?: string }) {
  if (!text) return <Text style={s.body}> </Text>;
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {paras.map((p, i) => (
        <Text key={i} style={s.body}>{p}</Text>
      ))}
    </>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <>
      <Text style={s.h4}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 3 }}>
          <Text style={{ ...s.bodyTight, width: 14, color: ink[400] }}>{"•"}</Text>
          <Text style={{ ...s.bodyTight, flex: 1 }}>{item}</Text>
        </View>
      ))}
    </>
  );
}

function PhaseBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.h4}>{title}</Text>
      {items.length === 0 ? (
        <Text style={s.bodyTight}>{"—"}</Text>
      ) : (
        items.map((item, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
            <Text style={{ ...s.bodyTight, width: 22, color: ink[400], fontFamily: "Times-Roman" }}>{i + 1}.</Text>
            <Text style={{ ...s.bodyTight, flex: 1 }}>{item}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function MetaRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaKey}>{k}</Text>
      <Text style={{ ...s.metaVal, fontFamily: mono ? "Courier" : "Helvetica" }}>{v}</Text>
    </View>
  );
}

// ============================================================
// Legacy compact report (pre-v2 jobs)
// ============================================================

function LegacyReviewDocument({ filename, jobId, manuscript, memory, generatedAt }: ReportInput) {
  const report = memory.report;
  const qa = memory.qa;
  const reviews = Object.values(memory.reviews ?? {}).filter(Boolean) as NonNullable<JobMemory["reviews"][string]>[];
  const allFindings = reviews.flatMap((r) => (r ? r.findings : []));
  const sortedFindings = [...allFindings].sort(severityRank);

  return (
    <Document
      title={`Dissertation Editing Center · Review of ${filename}`}
      author="Dissertation Editing Center"
      subject="Scholarly review report"
      creator="Dissertation Editing Center"
    >
      <Page size="LETTER" style={s.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.imprint}>Dissertation Editing Center</Text>
          <Text style={s.imprint}>{monthOf(generatedAt)}</Text>
        </View>
        <View style={s.rule} />

        <Text style={s.imprint}>Editorial review report</Text>
        <Text style={s.title}>{deriveTitle(filename)}</Text>
        <Text style={s.dek}>
          A scholarly review of the submitted manuscript, validated by the QA &amp; Final Approval Agent.
        </Text>

        <View style={s.hair} />
        <MetaRow k="File reviewed" v={filename} />
        <MetaRow k="Job ID" v={jobId} mono />
        <MetaRow k="Word count" v={manuscript.wordCount.toLocaleString()} />
        <MetaRow k="Issued" v={generatedAt.toISOString().slice(0, 10)} />

        <Text style={s.chapter}>I. Executive summary</Text>
        <Paragraphs text={report?.executiveSummary ?? "An executive summary was not produced for this review."} />

        <Text style={s.chapter}>II. Scores</Text>
        {qa && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: ink[200] }}>
              <Text>Submission readiness</Text>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 14 }}>{qa.submissionReadiness} / 100</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: ink[200] }}>
              <Text>Overall quality</Text>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 14 }}>{qa.qualityScore} / 100</Text>
            </View>
          </>
        )}

        <Footer page={1} jobId={jobId} />
      </Page>

      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>III. Reviewer findings</Text>
        <Text style={s.h2}>{sortedFindings.length} findings across {reviews.length} reviewer{reviews.length === 1 ? "" : "s"}</Text>
        <View style={s.hair} />
        {sortedFindings.length === 0 ? (
          <Text style={s.body}>No findings were produced for this manuscript.</Text>
        ) : (
          sortedFindings.map((f, i) => <FindingItem key={f.id ?? i} f={f} />)
        )}
        <Footer page={2} jobId={jobId} />
      </Page>

      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>IV. Revision plan</Text>
        {(report?.revisionPlan ?? defaultPlan(sortedFindings)).map((step, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 8 }}>
            <Text style={{ ...s.body, width: 22, color: ink[400], fontFamily: "Times-Roman" }}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Text style={{ ...s.body, flex: 1 }}>{step}</Text>
          </View>
        ))}
        <Footer page={3} jobId={jobId} />
      </Page>
    </Document>
  );
}

function FindingItem({ f }: { f: ReviewFinding }) {
  const anchor = [f.page ? `p. ${f.page}` : null, f.section, f.type].filter(Boolean).join(" · ");
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: ink[200] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 8.5, color: ink[500], letterSpacing: 1.5, textTransform: "uppercase" }}>{anchor || f.type}</Text>
        <Text style={{ fontSize: 8.5, color: ink[900], letterSpacing: 1.5, textTransform: "uppercase" }}>{f.severity}</Text>
      </View>
      <Text style={s.excerpt}>{`“${f.excerpt}”`}</Text>
      <Text style={{ ...s.body, marginTop: 4 }}>
        <Text style={{ color: ink[900], fontFamily: "Helvetica-Bold" }}>Issue. </Text>
        {f.issue}
      </Text>
      <Text style={{ fontSize: 10, color: ink[700], lineHeight: 1.55 }}>
        <Text style={{ color: ink[900], fontFamily: "Helvetica-Bold" }}>Recommendation. </Text>
        {f.recommendation}
      </Text>
    </View>
  );
}

function Footer({ page, jobId }: { page: number; jobId: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text>Dissertation Editing Center · Scholarly review report</Text>
      <Text>{jobId}</Text>
      <Text>{page}</Text>
    </View>
  );
}

function deriveTitle(filename: string): string {
  const stem = filename.replace(/\.(pdf|docx)$/i, "").replace(/[-_]+/g, " ");
  return `Review of "${stem}"`;
}

function severityRank(a: ReviewFinding, b: ReviewFinding): number {
  const rank: Record<string, number> = { major: 0, moderate: 1, minor: 2 };
  return (rank[a.severity] ?? 9) - (rank[b.severity] ?? 9);
}

function defaultPlan(findings: ReviewFinding[]): string[] {
  return findings.slice(0, 8).map((f) => {
    const where = [f.page ? `p. ${f.page}` : null, f.section].filter(Boolean).join(" · ");
    return `${where ? where + ". " : ""}${f.recommendation}`;
  });
}

function monthOf(d: Date): string {
  const m = d.getMonth() + 1;
  return `${m.toString().padStart(2, "0")}.${d.getFullYear()}`;
}
