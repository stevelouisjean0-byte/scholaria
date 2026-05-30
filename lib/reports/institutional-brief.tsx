/**
 * Institutional brief PDF — a one-page handout enterprise / university
 * procurement reviewers can take to a committee meeting. Renders on-demand,
 * no static binary in the repo, never stale.
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

const ink = {
  900: "#0b0e16",
  700: "#272d3c",
  600: "#3d4557",
  500: "#5b6478",
  300: "#b9c1d0",
  200: "#dadfe8",
  100: "#eef0f4"
};

const styles = StyleSheet.create({
  page: { paddingHorizontal: 56, paddingVertical: 56, fontFamily: "Helvetica", color: ink[900] },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: ink[500], textTransform: "uppercase" },
  h1: { fontFamily: "Times-Roman", fontSize: 24, marginTop: 8, lineHeight: 1.15 },
  lead: { fontSize: 11, color: ink[700], marginTop: 12, lineHeight: 1.55 },
  hr: { borderTopWidth: 0.5, borderTopColor: ink[200], marginVertical: 22 },
  h2: { fontFamily: "Times-Roman", fontSize: 14, marginBottom: 6 },
  body: { fontSize: 10, color: ink[700], lineHeight: 1.55, marginBottom: 4 },
  row: { flexDirection: "row", gap: 16, marginBottom: 14 },
  col: { flex: 1 },
  label: { fontSize: 8, letterSpacing: 1.6, color: ink[500], textTransform: "uppercase", marginBottom: 4 },
  bullet: { fontSize: 10, color: ink[700], lineHeight: 1.5, marginBottom: 3 },
  footer: {
    position: "absolute",
    left: 56,
    right: 56,
    bottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: ink[500],
    borderTopWidth: 0.5,
    borderTopColor: ink[200],
    paddingTop: 8
  }
});

function Brief() {
  return (
    <Document
      title="Dissertation Editing Center — Institutional Brief"
      author="Dissertation Editing Center"
      creator="dissertationeditingcenter.com"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.eyebrow}>Institutional brief · 2026</Text>
        <Text style={styles.h1}>
          Dissertation Editing Center{"\n"}for university programs.
        </Text>
        <Text style={styles.lead}>
          A coordinated multi-agent review system that delivers chapter-grade dissertation review
          in 24 hours. Built for doctoral candidates; deployable as institutional capacity for
          writing centers, graduate schools, and research offices.
        </Text>

        <View style={styles.hr} />

        <Text style={styles.h2}>The problem we solve</Text>
        <Text style={styles.body}>
          Doctoral candidates produce 25–40 chapter revision passes per program. Traditional
          editing services price each pass at $300–$900 with 7–10 day turnaround. Writing centers
          run at 8–12x capacity. Candidates default to ad-hoc ChatGPT use with no audit trail.
        </Text>
        <Text style={styles.body}>
          Our platform delivers methodology alignment, APA 7 verification, citation cross-check,
          and a 0–100 readiness score in 24 hours, at a flat subscription, with every finding
          sourced to a verbatim manuscript excerpt and exportable as a committee-shareable audit
          record.
        </Text>

        <View style={styles.hr} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>What we deliver</Text>
            <Text style={styles.bullet}>· Annotated PDF — page-anchored margin notes</Text>
            <Text style={styles.bullet}>· APA 7 report — heading levels, DOIs, hanging indents</Text>
            <Text style={styles.bullet}>· Methodology alignment — RQs ↔ design coherence</Text>
            <Text style={styles.bullet}>· Citation cross-check vs. reference list</Text>
            <Text style={styles.bullet}>· Submission readiness 0–100 with decomposition</Text>
            <Text style={styles.bullet}>· Exportable audit log per review</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>How we differ</Text>
            <Text style={styles.bullet}>· Critiques, never authors — first principle</Text>
            <Text style={styles.bullet}>· Editorial board of Ph.D. advisors sets the rules</Text>
            <Text style={styles.bullet}>· 24h turnaround (vs. 7–10 days at human services)</Text>
            <Text style={styles.bullet}>· Flat subscription (vs. per-word pricing)</Text>
            <Text style={styles.bullet}>· No model-training on uploaded manuscripts</Text>
            <Text style={styles.bullet}>· FERPA-aware, SOC 2 Type II in progress</Text>
          </View>
        </View>

        <View style={styles.hr} />

        <Text style={styles.h2}>Pilot template — single term</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Week 1 — onboarding</Text>
            <Text style={styles.body}>
              Identity, retention policy, branding configured with your IT and writing-center
              leads. SSO/SCIM provisioning. DPA executed.
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Weeks 2–6 — cohort</Text>
            <Text style={styles.body}>
              Two to three programs deploy to active doctoral and graduate cohorts. Concierge
              channel staffed for cohort questions.
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Weeks 7–12 — review</Text>
            <Text style={styles.body}>
              Program analytics, submission readiness lift, writing-center load reduction reported
              back to your office.
            </Text>
          </View>
        </View>

        <View style={styles.hr} />

        <Text style={styles.h2}>Pilot outcome benchmark</Text>
        <Text style={styles.body}>
          Anonymised Mid-Atlantic R1 R2 Ed.D. program · 47 active candidates · single term ·
          baseline median readiness 58/100 · post-pilot median readiness 76/100 · three of four
          committee chairs requested access to audit logs alongside drafts.
        </Text>

        <View style={styles.footer} fixed>
          <Text>Dissertation Editing Center · dissertationeditingcenter.com</Text>
          <Text>Steve Louis-Jean, Founder · founder@dissertationeditingcenter.com · (407) 850-8823</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderInstitutionalBrief(): Promise<Uint8Array> {
  return renderToBuffer(<Brief />);
}
