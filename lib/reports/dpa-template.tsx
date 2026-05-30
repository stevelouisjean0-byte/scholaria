/**
 * Data Processing Addendum (DPA) — template that institutional procurement
 * can use as a starting point. Renders on-demand so the policy version
 * stamp is always current.
 *
 * Disclaimer: this is a template. Institutional counsel must review and
 * mark up before execution. Not legal advice.
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
  500: "#5b6478",
  300: "#b9c1d0",
  200: "#dadfe8"
};

const styles = StyleSheet.create({
  page: { paddingHorizontal: 56, paddingVertical: 56, fontFamily: "Helvetica", color: ink[900] },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: ink[500], textTransform: "uppercase" },
  h1: { fontFamily: "Times-Roman", fontSize: 22, marginTop: 8, lineHeight: 1.2 },
  disclaimer: {
    fontSize: 9,
    color: ink[700],
    backgroundColor: "#fef3c7",
    padding: 10,
    marginTop: 16,
    lineHeight: 1.5
  },
  h2: { fontFamily: "Times-Roman", fontSize: 13, marginTop: 18, marginBottom: 6 },
  body: { fontSize: 10, color: ink[700], lineHeight: 1.55, marginBottom: 6 },
  list: { fontSize: 10, color: ink[700], lineHeight: 1.5, marginBottom: 3, marginLeft: 12 },
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

function DPA() {
  return (
    <Document
      title="Dissertation Editing Center — DPA template"
      author="Dissertation Editing Center"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.eyebrow}>Template · v1.0 · 2026</Text>
        <Text style={styles.h1}>Data Processing Addendum — template</Text>

        <Text style={styles.disclaimer}>
          This template is provided as a starting point for institutional procurement review. It
          is not executed until both parties countersign. Institutional counsel must review and
          mark up. Not legal advice. Final executable version available on request from
          support@doctoralediting.com.
        </Text>

        <Text style={styles.h2}>1. Parties &amp; scope</Text>
        <Text style={styles.body}>
          This addendum supplements the Master Services Agreement between Dissertation Editing
          Center ("Processor") and the contracting institution ("Controller") and governs the
          Processor's handling of Personal Data on the Controller's behalf.
        </Text>

        <Text style={styles.h2}>2. Categories of data &amp; data subjects</Text>
        <Text style={styles.list}>· Manuscript files uploaded by Authorized Users (doctoral candidates, faculty)</Text>
        <Text style={styles.list}>· Authentication identifiers (institutional email, SSO subject claim)</Text>
        <Text style={styles.list}>· Review metadata (timestamps, agent invocation logs, readiness scores)</Text>
        <Text style={styles.list}>· No payment data (Stripe is a separate processor on the Controller's behalf)</Text>

        <Text style={styles.h2}>3. Purpose</Text>
        <Text style={styles.body}>
          Processor will process Personal Data solely to (i) execute the chapter-grade review
          workflow described in the MSA, (ii) maintain a per-job audit log, and (iii) provide
          program-level analytics to the Controller. Processor will not use Personal Data for
          training, profiling, or marketing.
        </Text>

        <Text style={styles.h2}>4. Sub-processors</Text>
        <Text style={styles.body}>
          The current sub-processor list is maintained at dissertationeditingcenter.com/security/subprocessors
          and includes: Anthropic PBC (US, no-train), Supabase Inc. (US-region Postgres), Upstash
          Inc. (US-region Redis), Vercel Inc. (US-region edge), Resend Inc. (US transactional
          email). Material changes communicated to Controller at least 30 days in advance.
        </Text>

        <Text style={styles.h2}>5. Security measures</Text>
        <Text style={styles.list}>· TLS 1.3 in transit; AES-256 at rest in single-tenant US-region Postgres</Text>
        <Text style={styles.list}>· SSO (SAML/OIDC) and SCIM provisioning available on Enterprise tier</Text>
        <Text style={styles.list}>· Role-based access controls; least-privilege production access</Text>
        <Text style={styles.list}>· SOC 2 Type II audit in progress (target Q4 2026)</Text>
        <Text style={styles.list}>· FERPA-aware controls; retention configurable per program</Text>

        <Text style={styles.h2}>6. Data subject rights</Text>
        <Text style={styles.body}>
          Processor will assist Controller in responding to data subject requests for access,
          rectification, erasure, restriction, and portability within five (5) business days of a
          documented request from the Controller.
        </Text>

        <Text style={styles.h2}>7. Retention &amp; deletion</Text>
        <Text style={styles.body}>
          Manuscript bytes are retained per the Controller-selected program policy. Hard deletion
          is honoured on demand within twenty-four (24) hours of an authorized request from the
          Controller or the data subject, with email confirmation. On termination of the MSA, all
          Personal Data will be deleted within ninety (90) days.
        </Text>

        <Text style={styles.h2}>8. Breach notification</Text>
        <Text style={styles.body}>
          Processor will notify Controller within seventy-two (72) hours of becoming aware of a
          Personal Data Breach affecting Controller's data. Notice will include scope, impact,
          containment status, and remediation timeline.
        </Text>

        <Text style={styles.h2}>9. International transfers</Text>
        <Text style={styles.body}>
          Personal Data is stored and processed in the United States. For Controllers with EU
          data subjects, Standard Contractual Clauses (Module 2, Controller-to-Processor) are
          incorporated by reference and available as Annex A on request.
        </Text>

        <Text style={styles.h2}>10. Audit rights</Text>
        <Text style={styles.body}>
          On reasonable notice and no more than once per twelve (12) months, Controller may
          request a copy of the most recent SOC 2 Type II attestation (when issued) and a written
          summary of the Processor's information security program. On-site audits available for
          Enterprise customers under separate engagement.
        </Text>

        <Text style={styles.h2}>Signatures</Text>
        <Text style={styles.body}>
          Controller signatory: ____________________________ Date: ____________{"\n"}
          Processor signatory: ____________________________ Date: ____________
        </Text>

        <View style={styles.footer} fixed>
          <Text>Template — not executed. Final version: support@doctoralediting.com · Dissertation Editing Center, 8315 Northern Blvd Ste 2, Jackson Heights, NY 11372</Text>
          <Text>v1.0 · 2026</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderDPA(): Promise<Uint8Array> {
  return renderToBuffer(<DPA />);
}
