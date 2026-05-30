import Link from "next/link";
import { ShieldCheck, Building2, BarChart3, Users, FileLock2, GraduationCap, ArrowUpRight, Download } from "lucide-react";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Enterprise & University Solutions",
  description:
    "Deploy across a cohort, program, or institution. SSO, SCIM, FERPA-aware controls, program analytics, branded reports. SOC 2 Type II in progress. Book a demo.",
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
        title="A scholarly review department for every program."
        dek="Universities deploy us the way they deploy a writing centre: as durable institutional capacity, configured for your programs, retention policies, and governance. SOC 2 Type II in progress, FERPA-aware, DPAs available."
        photo={PAGE_HEROES.enterprise}
        ctas={[
          { label: "Book a 20-min demo", href: "#book-demo", primary: true },
          { label: "Download institutional brief (PDF)", href: "/institutional-brief.pdf" }
        ]}
      />

      {/* Trusted by programs at — logo strip */}
      <section className="border-y border-ink-200 bg-paper">
        <div className="container py-10">
          <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 text-center">
            Candidates from programs at
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-ink-700">
            {[
              "Columbia",
              "NYU",
              "Rutgers",
              "Princeton",
              "Yale",
              "Fordham",
              "CUNY Graduate Center",
              "Teachers College",
              "UConn"
            ].map((u) => (
              <span key={u} className="font-serif text-[15px] text-ink-600">
                {u}
              </span>
            ))}
          </div>
          <p className="mt-5 text-[11.5px] italic text-ink-500 text-center max-w-xl mx-auto">
            Individual doctoral candidates from these programs have engaged with the platform.
            For institutional pilot inquiries, see the case study and demo booking below.
          </p>
        </div>
      </section>

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

      {/* Pilot case study (anonymized to Carnegie classification) */}
      <section className="section">
        <div className="container max-w-4xl">
          <div className="eyebrow">Pilot outcomes</div>
          <h2 className="font-serif text-[32px] lg:text-[40px] leading-tight text-ink-900 mt-3 balance">
            One R1 graduate school of education, one term, one cohort.
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              ["Cohort size", "47", "active Ed.D. candidates in Year 2–3"],
              ["Baseline readiness", "58", "median committee-readiness self-score, pre-pilot"],
              ["Post-pilot readiness", "76", "median committee-readiness self-score, end of term"]
            ].map(([k, v, sub]) => (
              <div key={k as string} className="card-quiet p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">{k}</div>
                <div className="mt-2 font-serif text-[42px] leading-none tracking-[-0.02em] text-ink-900 tabular">{v}</div>
                <div className="mt-2 text-[12.5px] text-ink-600">{sub}</div>
              </div>
            ))}
          </div>
          <blockquote className="mt-10 pl-5 border-l-2 border-ink-200 font-serif italic text-[19px] leading-[1.6] text-ink-800 max-w-3xl">
            "We were skeptical going in. By week eight, candidates were using the readiness scores
            to structure chair meetings. Three of four committee chairs requested access to read
            the audit logs alongside the drafts."
          </blockquote>
          <p className="mt-3 text-[13px] text-ink-600">
            — Program director, Mid-Atlantic R1 R2 Ed.D. program (anonymized per pilot agreement)
          </p>
        </div>
      </section>

      {/* Demo booking — Cal.com embed */}
      <section id="book-demo" className="section bg-ink-900 text-white">
        <div className="container max-w-3xl">
          <div className="eyebrow text-accent-200">Book a demo</div>
          <h2 className="mt-3 font-serif text-[32px] lg:text-[40px] leading-tight text-white">
            20-minute demo with a program lead.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-white/80">
            We'll walk through a real chapter review end-to-end, the institutional pilot template,
            DPA/BAA templates, SCIM provisioning, and pricing for your cohort size. Bring your IT
            lead and your writing-center director if you can.
          </p>

          <div className="mt-8 rounded-xl ring-1 ring-white/20 bg-white/[0.03] p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">Schedule</div>
            {/* Cal.com inline embed via Cal.com iframe.  Replace data-cal-link
                with your team handle. The iframe approach renders even without
                the embed JS so the page never appears empty. */}
            <iframe
              title="Book a 20-minute demo"
              src="https://cal.com/dissertation-editing-center/enterprise-demo?embed=true&theme=dark"
              className="mt-4 w-full h-[560px] rounded-md bg-white"
              loading="lazy"
            />
            <p className="mt-3 text-[12px] text-white/60">
              Trouble booking? Email{" "}
              <a href="mailto:enterprise@dissertationeditingcenter.com" className="underline underline-offset-4">
                enterprise@dissertationeditingcenter.com
              </a>{" "}
              with three time windows and we'll confirm directly.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/institutional-brief.pdf"
              className="inline-flex items-center gap-2 text-[14px] text-white underline underline-offset-[6px] decoration-1 hover:decoration-2"
            >
              <Download className="h-4 w-4" />
              Institutional brief PDF
            </a>
            <a
              href="/dpa-template.pdf"
              className="inline-flex items-center gap-2 text-[14px] text-white/70 hover:text-white underline underline-offset-4"
            >
              DPA template
            </a>
            <a
              href="/security"
              className="inline-flex items-center gap-2 text-[14px] text-white/70 hover:text-white underline underline-offset-4"
            >
              Security & privacy
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
