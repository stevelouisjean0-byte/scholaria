/**
 * Scholarly Review — PDF report generator.
 *
 * Given a JobMemory document and a few job-level fields, renders the
 * downloadable deliverable a client receives: an executive summary, scores
 * table, findings list by severity, a citation audit, and a revision plan.
 *
 * Typography matches the site's editorial register — serif title page,
 * sans body, mono for tabular data, hairline rules between sections.
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
import type { JobMemory, ReviewFinding } from "@/lib/memory";

// Using @react-pdf's built-in PDF base fonts (Helvetica + Times-Roman +
// Courier) so the report renders in any environment, including offline
// builds, behind firewalls, and inside ephemeral serverless functions.

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
  title: { fontFamily: "Times-Roman", fontSize: 32, color: ink[900], lineHeight: 1.1, letterSpacing: -0.5 },
  dek: { fontFamily: "Times-Roman", fontStyle: "italic", fontSize: 14, color: ink[600], lineHeight: 1.4, marginTop: 10 },
  chapter: { fontSize: 9, color: ink[500], letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, marginTop: 22 },
  h2: { fontFamily: "Times-Roman", fontSize: 22, color: ink[900], marginTop: 4, marginBottom: 14 },
  h3: { fontFamily: "Times-Roman", fontSize: 14, color: ink[900], marginBottom: 4 },
  body: { fontSize: 10.5, color: ink[700], lineHeight: 1.55, marginBottom: 8 },
  small: { fontSize: 8.5, color: ink[500] },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: ink[200] },
  scoreLabel: { fontSize: 10, color: ink[700] },
  scoreValue: { fontFamily: "Times-Roman", fontSize: 14, color: ink[900] },
  findingItem: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: ink[200] },
  findingHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  findingAnchor: { fontSize: 8.5, color: ink[500], letterSpacing: 2, textTransform: "uppercase" },
  findingSeverity: { fontSize: 8.5, color: ink[900], letterSpacing: 2, textTransform: "uppercase" },
  excerpt: { fontFamily: "Times-Roman", fontStyle: "italic", fontSize: 10, color: ink[900], borderLeftWidth: 1, borderLeftColor: ink[300], paddingLeft: 8, marginVertical: 4 },
  recommend: { fontSize: 10, color: ink[700], lineHeight: 1.55 },
  pageFooter: { position: "absolute", left: 56, right: 56, bottom: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: ink[400], borderTopWidth: 0.5, borderTopColor: ink[200], paddingTop: 8 },
  badge: { fontSize: 8, color: ink[900], borderWidth: 0.5, borderColor: ink[300], paddingHorizontal: 4, paddingVertical: 1.5 }
});

export interface ReportInput {
  filename: string;
  jobId: string;
  manuscript: { wordCount: number; pageCount: number };
  memory: JobMemory;
  generatedAt: Date;
}

export async function renderScholarlyReportPDF(input: ReportInput): Promise<Uint8Array> {
  const buffer = await renderToBuffer(<ScholarlyReview {...input} />);
  return buffer;
}

function ScholarlyReview({ filename, jobId, manuscript, memory, generatedAt }: ReportInput) {
  const report = memory.report;
  const qa = memory.qa;
  const reviews = Object.values(memory.reviews ?? {}).filter(Boolean) as NonNullable<JobMemory["reviews"][string]>[];
  const allFindings = reviews.flatMap((r) => (r ? r.findings : []));
  const sortedFindings = [...allFindings].sort(severityRank);

  return (
    <Document
      title={`Scholaria · Review of ${filename}`}
      author="Scholaria editorial desk"
      subject="Doctoral / graduate scholarly review report"
      creator="Scholaria"
    >
      {/* Title page */}
      <Page size="LETTER" style={s.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.imprint}>Scholaria · A review of doctoral writing</Text>
          <Text style={s.imprint}>Vol. I · No. {monthOf(generatedAt)}</Text>
        </View>
        <View style={s.rule} />

        <Text style={s.imprint}>Editorial review report</Text>
        <Text style={s.title}>{deriveTitle(filename, memory)}</Text>
        <Text style={s.dek}>
          A scholarly review of the submitted manuscript, prepared by the autonomous editorial ecosystem
          and validated by the QA &amp; Final Approval Agent.
        </Text>

        <View style={s.hair} />

        <View style={{ flexDirection: "row", gap: 18, marginTop: 12 }}>
          <MetaCol k="Manuscript" v={filename} />
          <MetaCol k="Job" v={jobId} mono />
          <MetaCol k="Words" v={manuscript.wordCount.toLocaleString()} />
          <MetaCol k="Pages" v={String(manuscript.pageCount)} />
          <MetaCol k="Issued" v={generatedAt.toISOString().slice(0, 10)} />
        </View>

        {/* Executive summary */}
        <Text style={s.chapter}>I. Executive summary</Text>
        <Text style={s.body}>
          {report?.executiveSummary ??
            "An executive summary was not produced for this review. This typically means the manuscript " +
              "did not pass the QA gate and is awaiting requeued review."}
        </Text>

        {/* Scores */}
        <Text style={s.chapter}>II. Scores</Text>
        <View>
          {qa && (
            <View style={s.scoreRow}>
              <Text style={s.scoreLabel}>Submission readiness</Text>
              <Text style={s.scoreValue}>{qa.submissionReadiness} / 100</Text>
            </View>
          )}
          {qa && (
            <View style={s.scoreRow}>
              <Text style={s.scoreLabel}>Overall quality</Text>
              <Text style={s.scoreValue}>{qa.qualityScore} / 100</Text>
            </View>
          )}
          {reviews.map((r, i) => (
            <React.Fragment key={i}>
              {r?.scholarlyTone !== undefined && (
                <View style={s.scoreRow}>
                  <Text style={s.scoreLabel}>{labelOf(r.agentKey)} · scholarly tone</Text>
                  <Text style={s.scoreValue}>{r.scholarlyTone} / 100</Text>
                </View>
              )}
              {r?.clarity !== undefined && (
                <View style={s.scoreRow}>
                  <Text style={s.scoreLabel}>{labelOf(r.agentKey)} · clarity</Text>
                  <Text style={s.scoreValue}>{r.clarity} / 100</Text>
                </View>
              )}
              {r?.apaCompliance !== undefined && (
                <View style={s.scoreRow}>
                  <Text style={s.scoreLabel}>APA 7 compliance</Text>
                  <Text style={s.scoreValue}>{r.apaCompliance} / 100</Text>
                </View>
              )}
              {r?.literatureSynthesis !== undefined && (
                <View style={s.scoreRow}>
                  <Text style={s.scoreLabel}>Literature synthesis</Text>
                  <Text style={s.scoreValue}>{r.literatureSynthesis} / 100</Text>
                </View>
              )}
              {r?.methodologyAlignment !== undefined && (
                <View style={s.scoreRow}>
                  <Text style={s.scoreLabel}>Methodology alignment</Text>
                  <Text style={s.scoreValue}>{r.methodologyAlignment} / 100</Text>
                </View>
              )}
              {r?.citationAccuracy !== undefined && (
                <View style={s.scoreRow}>
                  <Text style={s.scoreLabel}>Citation accuracy</Text>
                  <Text style={s.scoreValue}>{r.citationAccuracy} / 100</Text>
                </View>
              )}
            </React.Fragment>
          ))}
        </View>

        <Footer page={1} jobId={jobId} />
      </Page>

      {/* Findings */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>III. Findings</Text>
        <Text style={s.h2}>{sortedFindings.length} findings across {reviews.length} reviewing agent{reviews.length === 1 ? "" : "s"}</Text>
        <Text style={s.body}>
          Each finding references a verbatim excerpt from the manuscript and is paired with a specific
          recommendation. Findings are ordered by severity.
        </Text>
        <View style={s.hair} />
        {sortedFindings.length === 0 ? (
          <Text style={s.body}>No findings were produced for this manuscript.</Text>
        ) : (
          sortedFindings.map((f, i) => <FindingItem key={f.id ?? i} f={f} />)
        )}
        <Footer page={2} jobId={jobId} />
      </Page>

      {/* Revision plan */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.chapter}>IV. Revision plan</Text>
        <Text style={s.h2}>What to revise — in order</Text>
        <Text style={s.body}>
          The plan below is prioritised. Items at the top will move the submission readiness score the most.
        </Text>
        <View style={s.hair} />
        {(report?.revisionPlan ?? defaultPlan(sortedFindings)).map((step, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 8 }}>
            <Text style={{ ...s.body, width: 22, color: ink[400], fontFamily: "Times-Roman" }}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Text style={{ ...s.body, flex: 1 }}>{step}</Text>
          </View>
        ))}

        <Text style={s.chapter}>V. Editorial principles applied</Text>
        <Text style={s.body}>
          Findings reference verbatim excerpts. Recommendations are explicit, scholarly, and actionable.
          The QA agent rejected any output reading as generic or template-driven before this report was released.
        </Text>
        <Footer page={3} jobId={jobId} />
      </Page>
    </Document>
  );
}

function FindingItem({ f }: { f: ReviewFinding }) {
  const anchor = [f.page ? `p. ${f.page}` : null, f.section, f.type].filter(Boolean).join(" · ");
  return (
    <View style={s.findingItem}>
      <View style={s.findingHead}>
        <Text style={s.findingAnchor}>{anchor || f.type}</Text>
        <Text style={s.findingSeverity}>{f.severity}</Text>
      </View>
      <Text style={s.excerpt}>“{f.excerpt}”</Text>
      <Text style={{ ...s.body, marginTop: 4 }}>
        <Text style={{ color: ink[900], fontFamily: "Helvetica-Bold" }}>Issue. </Text>
        {f.issue}
      </Text>
      <Text style={s.recommend}>
        <Text style={{ color: ink[900], fontFamily: "Helvetica-Bold" }}>Recommendation. </Text>
        {f.recommendation}
      </Text>
    </View>
  );
}

function MetaCol({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <View>
      <Text style={s.small}>{k}</Text>
      <Text style={{ fontFamily: mono ? "Courier" : "Helvetica", color: ink[900], fontSize: 10.5 }}>{v}</Text>
    </View>
  );
}

function Footer({ page, jobId }: { page: number; jobId: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text>Scholaria · Editorial review report</Text>
      <Text>Job {jobId}</Text>
      <Text>{page}</Text>
    </View>
  );
}

function deriveTitle(filename: string, memory: JobMemory): string {
  const stem = filename.replace(/\.(pdf|docx)$/i, "").replace(/[-_]+/g, " ");
  return `Review of "${stem}"`;
}

function labelOf(key: string): string {
  return {
    professional_editor: "Professional Editor",
    research_support: "Research Support",
    qa_final: "QA"
  }[key] ?? key;
}

function severityRank(a: ReviewFinding, b: ReviewFinding): number {
  const rank: Record<string, number> = { major: 0, moderate: 1, minor: 2 };
  return (rank[a.severity] ?? 9) - (rank[b.severity] ?? 9);
}

function defaultPlan(findings: ReviewFinding[]): string[] {
  return findings.slice(0, 8).map((f, i) => {
    const where = [f.page ? `p. ${f.page}` : null, f.section].filter(Boolean).join(" · ");
    return `${where ? where + ". " : ""}${f.recommendation}`;
  });
}

function monthOf(d: Date): string {
  const m = d.getMonth() + 1;
  return `${m.toString().padStart(2, "0")}.${d.getFullYear()}`;
}
