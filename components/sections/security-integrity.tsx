import { Lock, ShieldCheck, FileLock2, Server, Users, BadgeCheck, BookOpen, Eye, Scale } from "lucide-react";

const SECURITY = [
  { icon: Lock,        title: "Encrypted in transit & at rest", body: "TLS 1.3 on the wire. AES-256 envelope encryption for stored manuscripts. Per-job keys, never re-used." },
  { icon: FileLock2,   title: "Retention you control",          body: "Plan-controlled retention windows. Enterprise institutions set retention at the programme level. Hard delete on request." },
  { icon: Server,      title: "Single-tenant data isolation",   body: "Manuscripts are scoped to your account. No cross-customer training. No retention by the model provider." },
  { icon: Users,       title: "Institutional SSO & SCIM",       body: "SAML 2.0 and OIDC for sign-in, SCIM 2.0 for provisioning. Audit logs exportable to your SIEM." },
  { icon: ShieldCheck, title: "FERPA-aware controls",           body: "Built to be deployed inside a FERPA-aware programme. DPAs and BAAs available on the Enterprise tier." },
  { icon: Eye,         title: "Full audit trail",               body: "Every agent invocation, finding, and revision is durable, replayable, and exportable. Nothing is opaque." }
];

const INTEGRITY = [
  { icon: BookOpen,   title: "We critique. We do not author.", body: "Scholaria never produces full replacement prose for entire sections. Findings reference verbatim excerpts and recommend changes the student decides whether to apply." },
  { icon: BadgeCheck, title: "Originality assistance, not bypass", body: "Turnitin-style overlap signals and paraphrase guidance — designed to make student work submission-ready, never to evade detection." },
  { icon: Scale,      title: "The QA agent has veto power",       body: "Any output that reads as AI-generated, generic, or template-driven is rejected and regenerated before it ever reaches a student." }
];

export function SecurityIntegrity() {
  return (
    <section className="section bg-canvas">
      <div className="container">
        <div className="grid grid-cols-12 gap-10">
          {/* Security */}
          <div className="col-span-12 lg:col-span-7">
            <span className="eyebrow">Security &amp; privacy</span>
            <h2 className="mt-4 h-display text-display-lg">
              Institutional-grade controls for doctoral work.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.65] text-ink-600">
              Scholaria handles unpublished doctoral research. The platform is engineered to be safe to
              deploy inside a writing centre, graduate school, or research office without compromise.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              {SECURITY.map((s) => (
                <div key={s.title} className="card-quiet p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 font-semibold text-[14.5px] text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-ink-600">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic integrity */}
          <div className="col-span-12 lg:col-span-5">
            <span className="eyebrow">Academic integrity</span>
            <h2 className="mt-4 h-display text-display-lg">
              The first principle of the platform.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.65] text-ink-600">
              Scholaria is not a ghostwriter and is not a paraphrase laundry. It is engineered to be
              defensible if a chair or committee asks how it was used. Every output is auditable.
            </p>

            <div className="mt-10 space-y-3">
              {INTEGRITY.map((s) => (
                <div key={s.title} className="card-quiet p-5 flex gap-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white shrink-0">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[14.5px] text-ink-900">{s.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-ink-600">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
