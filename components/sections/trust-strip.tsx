import { ShieldCheck, Lock, FileCheck, GraduationCap, Building2, BadgeCheck } from "lucide-react";

const PILLARS = [
  { icon: Lock,         label: "Encrypted uploads",      sub: "AES-256 in transit & at rest" },
  { icon: ShieldCheck,  label: "FERPA-aware",            sub: "Institution-controlled retention" },
  { icon: FileCheck,    label: "Academic integrity",     sub: "We critique, we do not author" },
  { icon: BadgeCheck,   label: "Originality assistance", sub: "Turnitin-style overlap signals" },
  { icon: GraduationCap, label: "Built for the cohort", sub: "Ph.D., Ed.D., DBA, master's" },
  { icon: Building2,    label: "Institutional SSO",      sub: "SAML / SCIM ready" }
];

export function TrustStrip() {
  return (
    <section className="border-y border-ink-100 bg-ink-50/40">
      <div className="container py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-6">
          {PILLARS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-ink-200 text-ink-700 shrink-0">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] text-ink-900 font-medium leading-tight">{label}</div>
                <div className="text-[12px] text-ink-500 leading-tight mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
