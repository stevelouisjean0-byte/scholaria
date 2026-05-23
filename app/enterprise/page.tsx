import Link from "next/link";
import { ShieldCheck, Building2, BarChart3, Users, FileLock2, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Enterprise & University Solutions",
  description:
    "Deploy Scholaria across a cohort, program, or institution. SSO, SCIM, FERPA-aware controls, program analytics, and branded reports.",
  alternates: { canonical: "/enterprise" }
};

const FEATURES = [
  { icon: Building2, title: "Institution-wide deployment", body: "Roll out Scholaria to a program, cohort, or entire institution with central provisioning." },
  { icon: ShieldCheck, title: "SSO, SCIM, and policy", body: "Enterprise SSO (SAML/OIDC), SCIM provisioning, and policy controls that match how universities operate." },
  { icon: FileLock2, title: "FERPA-aware controls", body: "Retention, residency, and access policies configured per program. Detailed audit trail." },
  { icon: BarChart3, title: "Program analytics", body: "Submission readiness over time, by program, by cohort. Identify writing-center load and learning gaps." },
  { icon: GraduationCap, title: "Branded deliverables", body: "Reports rendered with your institution's branding, voice, and writing-center workflow." },
  { icon: Users, title: "Concierge program lead", body: "A dedicated program lead works with your writing center, graduate school, or research office." }
];

export default function EnterprisePage() {
  return (
    <>
      <PageMasthead
        number="X"
        eyebrow="Enterprise & university solutions"
        title="A scholarly review department for every programme."
        dek="Universities deploy Scholaria the way they deploy a writing centre: as durable institutional capacity, configured for your programmes, retention policies, and governance."
        photo={PAGE_HEROES.enterprise}
        ctas={[
          { label: "Talk to enterprise", href: "/contact", primary: true },
          { label: "Read the editorial process", href: "/how-it-works" }
        ]}
      />

      <section className="section">
        <div className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-quiet p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-[17px] text-ink-900">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-ink-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container max-w-4xl">
          <div className="eyebrow">Pilot programs</div>
          <h2 className="headline mt-3">Designed to be deployed in a single term.</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              ["Week 1", "Onboarding & SSO", "Identity, retention policy, and branding configured with your IT and writing-center leads."],
              ["Weeks 2–6", "Pilot cohort", "Two to three programs deploy the platform to active doctoral and graduate cohorts."],
              ["Weeks 7–12", "Institutional review", "Program analytics, submission readiness lift, and writing-center load reported back to your office."]
            ].map(([when, what, why]) => (
              <li key={when as string} className="card-quiet p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">{when}</div>
                <h3 className="mt-2 font-serif text-[18px] text-ink-900">{what}</h3>
                <p className="mt-2 text-[14px] leading-6 text-ink-600">{why}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
