/**
 * Scholarly Review — PDF report generator.
 *
 * Renders the formal client-facing deliverable. When the job memory has a
 * `formalReport` block (new 12-section schema), the full executive-level
 * report is rendered. Otherwise we fall back to the legacy compact layout
 * for previously-delivered jobs whose memory predates the schema.
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
  page: { padding: 56, fontFamily: "Helvetica", fontSize: 10.5, color: ink[800], lineHeight: 1.5 },
  imprint: { fontSize: 8.5, color: ink[500], letterSpacing: 2, textTransform: "uppercase" },
  rule: { borderBottomWidth: 1, borderBottomColor: ink[900], marginTop: 8, marginBottom: 28 },
  hair: { borderBottomWidth: 0.5, borderBottomColor: ink[200], marginTop: 12, marginBottom: 12 },
  title: { fontFamily: "Times-Roman", fontSize: 30, color: ink[900], lineHeight: 1.1, letterSpacing: -0.5 },
  dek: { fontFamily: "Times-Roman", fontStyle: "italic", fontSize: 13, color: ink[600], lineHeight: 1.4, marginTop: 10 },
  chapter: { fontSize: 9, color: ink[500], letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, marginTop: 22 },
  h2: { fontFamily: "Times-Roman", fontSize: 20, color: ink[900], marginTop: 4, marginBottom: 14 },
  h3: { fontFamily: "Times-Roman", fontSize: 13, color: ink[900], marginBottom: 4, marginTop: 12 },
  h4: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: ink[900], marginBottom: 2, marginTop: 8 },
  body: { fontSize: 10.5, color: ink[700], lineHeight: 1.55, marginBottom: 8 },
  bodyTight: { fontSize: 10, color: ink[700], lineHeight: 1.5, marginBottom: 4 },
  small: { fontSize: 8.5, color: ink[500] },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: ink[200] },
  scoreLabel: { fontSize: 10, color: ink[700] },
  scoreValue: { fontFamily: "Times-Roman", fontSize: 14, color: ink[900] },
  metaRow: { flexDirection: "row", marginBottom: 4 },
  metaKey: { fontSize: 9, color: ink[500], width: 130 },
  metaVal: { fontSize: 10, color: ink[800], flex: 1 },
  card: { borderWidth: 0.5, borderColor: ink[200], borderRadius: 2, padding: 12, marginBottom: 10 },
  cardHeading: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: ink[900], marginBottom: 4 },
  cardBody: { fontSize: 10, color: ink[700], lineHeight: 1.5, marginBottom: 4 },
  cardLabel: { fontSize: 8.5, color: ink[500], letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 },
  excerpt: { fontFamily: "Times-Roman", fontStyle: "italic", fontSize: 10, color: ink[900], borderLeftWidth: 1, borderLeftColor: ink[300], paddingLeft: 8, marginVertical: 4 },
  pageFooter: { position: "absolute", left: 56, right: 56, bottom: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: ink[400], borderTopWidth: 0.5, borderTopColor: ink[200], paddingTop: 8 },
  pillRow: { flexDirection: "row", gap: 6, marginTop: 12 },
  pill: { fontSize: 8.5, color: ink[900], borderWidth: 0.5, borderColor: ink[300], paddingHorizontal: 6, paddingVertical: 2 },
  phaseBlock: { marginBottom: 14 }
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

function ScholarlyReview(input: ReportInput) {
  const { memory } = input;
  if (memory.formalReport) {
    return <FormalReviewDocument {...input} formal={memory.formalReport} />;
  }
  return <LegacyReviewDocument {...input} />;
}

// ============================================================
// Formal 12-section report (new pipeline)
// ============================================================

function FormalReviewDocument(
  input: ReportInput & { formal: FormalReport }
) {
  const { filename, jobId, manuscript, memory, generatedAt, displayId, clientName, servicePurchased, formal } = input;
  const qa = memory.qa;
  const cover = formal.cover ?? { documentTitle: undefined, servicePurchased: undefined, completedAt: "" };
  const display = displayId ?? jobId;
  const service = cover.servicePurchased ?? servicePurchased ?? "Scholarly review";

  return (
    <Document
      title={`Dissertation Editing Center · Review of ${filename}`}
      author="Dissertation Editing Center"
      subject="Scholarly review report"
      creator="Dissertation Editing Center"
    >
      {/* Page 1 — Cover + Executive Summary */}
      <Page size="LETTER" style={s.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.imprint}>Dissertation Editing Center</Text>
          <Text style={s.imprint}>{monthOf(generatedAt)}</Text>
        </View>
        <View style={s.rule} />

        <Text style={s.imprint}>I. Scholarly Review Report</Text>
        <Text style={s.title}>{cover.documentTitle ?? deriveTitle(filename)}</Text>
        <Text style={s.dek}>
          A formal scholarly review of the submitted manuscript, prepared by the multi-agent editorial
          ecosystem and validated by the Quality Assurance &amp; Final Approval Agent.
        </Text>

        <View style={s.hair} />

        {/* Cover-page metadata block */}
        <View style={{ marginTop: 6 }}>
          {clientName && <MetaRow k="Student name" v={clientName} />}
          <MetaRow k="Document title" v={cover.documentTitle ?? filename} />
          <MetaRow k="Service purchased" v={service} />
          <MetaRow k="Submission ID" v={display} />
          <MetaRow k="Internal job ID" v={jobId} mono />
          <MetaRow k="File reviewed" v={filename} />
          <MetaRow k="Word count" v={manuscript.wordCount.toLocaleString()} />
          {manuscript.pageCount > 0 && <MetaRow k="Page count" v={String(manuscript.pageCount)} />}
          <MetaRow
            k="Date completed"
            v={cover.completedAt ? cover.completedAt.slice(0, 10) : generatedAt.toISOString().slice(0, 10)}
          />
          {qa && (
            <MetaRow k="Submission readiness" v={`${qa.submissionReadiness} / 100`} />
          )}
          {qa && (
            <MetaRow k="Quality assurance score" v={`${qa.qualityScore} / 100`} />
          )}
        </View>

        <Text style={s.chapter}>II. Executive Summary</Text>
        <Paragraphs text={formal.executiveSummary} />

        <Footer page={1} jobId={display} />
      </Page>

      {/* Page 2 — Score explanations + Strengths */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>III. Readiness &amp; Quality Score Explanation</Text>
        <Text style={s.h3}>Submission readiness</Text>
        <Paragraphs text={formal.scoreExplanations?.readiness} />
        <Text style={s.h3}>Quality assurance</Text>
        <Paragraphs text={formal.scoreExplanations?.quality} />

        <Text style={s.chapter}>IV. Strengths</Text>
        {formal.strengths.length === 0 ? (
          <Text style={s.body}>No specific strengths were identified by the reviewing agents for this submission.</Text>
        ) : (
          formal.strengths.map((str, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardHeading}>{i + 1}. {str.heading}</Text>
              <Text style={s.cardBody}>{str.explanation}</Text>
              {str.evidence && (
                <>
                  <Text style={s.cardLabel}>Evidence</Text>
                  <Text style={s.excerpt}>{str.evidence}</Text>
                </>
              )}
              <Text style={s.cardLabel}>Why it matters academically</Text>
              <Text style={s.cardBody}>{str.academicSignificance}</Text>
            </View>
          ))
        )}

        <Footer page={2} jobId={display} />
      </Page>

      {/* Page 3 — Priority revisions */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>V. Priority Revisions</Text>
        <Text style={s.body}>
          The revisions below are ordered by their impact on a stronger submission. Address them in the order presented.
        </Text>
        {formal.priorityRevisions.length === 0 ? (
          <Text style={s.body}>No priority revisions were identified by the reviewing agents.</Text>
        ) : (
          formal.priorityRevisions.map((rev, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardHeading}>{i + 1}. {rev.issue}</Text>
              <Text style={s.cardLabel}>Why it matters</Text>
              <Text style={s.cardBody}>{rev.rationale}</Text>
              {rev.location && (
                <>
                  <Text style={s.cardLabel}>Where it appears</Text>
                  <Text style={s.cardBody}>{rev.location}</Text>
                </>
              )}
              <Text style={s.cardLabel}>Recommended remedy</Text>
              <Text style={s.cardBody}>{rev.remedy}</Text>
              {rev.exampleRewrite && (
                <>
                  <Text style={s.cardLabel}>Example of stronger wording</Text>
                  <Text style={s.excerpt}>{rev.exampleRewrite}</Text>
                </>
              )}
            </View>
          ))
        )}

        <Footer page={3} jobId={display} />
      </Page>

      {/* Page 4 — APA 7 + Citation integrity */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>VI. APA 7 Review</Text>
        <Paragraphs text={formal.apaReview?.overall} />
        {formal.apaReview?.findings?.length ? (
          formal.apaReview.findings.map((f, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardHeading}>{f.area}</Text>
              <Text style={s.cardLabel}>Finding</Text>
              <Text style={s.cardBody}>{f.finding}</Text>
              <Text style={s.cardLabel}>Recommendation</Text>
              <Text style={s.cardBody}>{f.recommendation}</Text>
            </View>
          ))
        ) : (
          <Text style={s.body}>No APA-specific findings were recorded.</Text>
        )}

        <Text style={s.chapter}>VII. Citation &amp; Reference Integrity</Text>
        <Paragraphs text={formal.citationIntegrity?.overall} />
        <ListBlock title="Missing references (cited in text, absent from reference list)" items={formal.citationIntegrity?.missingReferences ?? []} />
        <ListBlock title="Uncited references (present in reference list, never cited)" items={formal.citationIntegrity?.uncitedReferences ?? []} />
        <ListBlock title="Weak, outdated, or low-quality sources" items={formal.citationIntegrity?.weakOrOutdatedSources ?? []} />
        {formal.citationIntegrity?.notes && (
          <>
            <Text style={s.h4}>Notes</Text>
            <Paragraphs text={formal.citationIntegrity.notes} />
          </>
        )}

        <Footer page={4} jobId={display} />
      </Page>

      {/* Page 5 — Scholarly tone + Alignment */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>VIII. Scholarly Tone &amp; Writing Quality</Text>
        <Paragraphs text={formal.scholarlyTone?.overall} />
        <ListBlock title="Observations" items={formal.scholarlyTone?.observations ?? []} />
        {formal.scholarlyTone?.suggestedEdits?.length ? (
          <>
            <Text style={s.h4}>Suggested edits</Text>
            {formal.scholarlyTone.suggestedEdits.map((e, i) => (
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
        ) : null}

        <Text style={s.chapter}>IX. Alignment Review</Text>
        <Paragraphs text={formal.alignmentReview?.overall} />
        {formal.alignmentReview?.elements?.length ? (
          formal.alignmentReview.elements.map((el, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardHeading}>{el.element}</Text>
              <Text style={s.cardBody}>{el.assessment}</Text>
            </View>
          ))
        ) : null}

        <Footer page={5} jobId={display} />
      </Page>

      {/* Page 6 — Chapter-specific + Revision plan + Final recommendation */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>X. {formal.chapterSpecificReview?.sectionType ?? "Document"} Review</Text>
        {formal.chapterSpecificReview?.sections?.length ? (
          formal.chapterSpecificReview.sections.map((sec, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardHeading}>{sec.topic}</Text>
              <Text style={s.cardLabel}>Finding</Text>
              <Text style={s.cardBody}>{sec.finding}</Text>
              <Text style={s.cardLabel}>Recommendation</Text>
              <Text style={s.cardBody}>{sec.recommendation}</Text>
            </View>
          ))
        ) : (
          <Text style={s.body}>No section-specific findings were recorded.</Text>
        )}

        <Text style={s.chapter}>XI. Revision Plan</Text>
        <PhaseBlock title="First — revise these items before anything else" items={formal.revisionPlan?.first ?? []} />
        <PhaseBlock title="Second — strengthen these areas" items={formal.revisionPlan?.second ?? []} />
        <PhaseBlock title="Third — polish these final details" items={formal.revisionPlan?.third ?? []} />

        <Text style={s.chapter}>XII. Final Recommendation</Text>
        <Paragraphs text={formal.finalRecommendation} />

        <Footer page={6} jobId={display} />
      </Page>
    </Document>
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
          <Text style={{ ...s.bodyTight, width: 14, color: ink[400] }}>•</Text>
          <Text style={{ ...s.bodyTight, flex: 1 }}>{item}</Text>
        </View>
      ))}
    </>
  );
}

function PhaseBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={s.phaseBlock}>
      <Text style={s.h4}>{title}</Text>
      {items.length === 0 ? (
        <Text style={s.bodyTight}>—</Text>
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
// Legacy compact report (pre-formalReport jobs)
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
            <View style={s.scoreRow}>
              <Text style={s.scoreLabel}>Submission readiness</Text>
              <Text style={s.scoreValue}>{qa.submissionReadiness} / 100</Text>
            </View>
            <View style={s.scoreRow}>
              <Text style={s.scoreLabel}>Overall quality</Text>
              <Text style={s.scoreValue}>{qa.qualityScore} / 100</Text>
            </View>
          </>
        )}

        <Footer page={1} jobId={jobId} />
      </Page>

      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>III. Findings</Text>
        <Text style={s.h2}>{sortedFindings.length} findings across {reviews.length} reviewing agent{reviews.length === 1 ? "" : "s"}</Text>
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
        <Text style={{ fontSize: 8.5, color: ink[500], letterSpacing: 2, textTransform: "uppercase" }}>{anchor || f.type}</Text>
        <Text style={{ fontSize: 8.5, color: ink[900], letterSpacing: 2, textTransform: "uppercase" }}>{f.severity}</Text>
      </View>
      <Text style={s.excerpt}>{`"${f.excerpt}"`}</Text>
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
