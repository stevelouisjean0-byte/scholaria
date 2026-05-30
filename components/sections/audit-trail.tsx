import Link from "next/link";
import { FileText, ShieldCheck, History, ArrowUpRight } from "lucide-react";

/**
 * Audit trail homepage section — the strongest competitive moat vs. ChatGPT,
 * Claude DIY, and Grammarly. Reframes the platform as the answer to the
 * doctoral candidate's actual fear: "Can I defend my use of AI to my
 * committee?" — yes, because every finding is timestamped, sourced, and
 * exportable as a defensible audit record.
 */
export function AuditTrail() {
  return (
    <section className="section bg-ink-900 text-white">
      <div className="container">
        <header className="chapter">
          <span className="roman text-white">★</span>
          <span className="label text-white/70">Defensible to your committee</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-8 font-serif text-[40px] lg:text-[52px] leading-[1.04] tracking-[-0.025em] text-white balance">
            Every finding is timestamped, sourced, and exportable as a committee-shareable audit record.
          </h2>
          <p className="col-span-12 lg:col-span-4 text-[15px] leading-[1.7] text-white/80 lg:border-l lg:border-white/20 lg:pl-8">
            ChatGPT can't show your chair what it did or why. We can. The audit log is the artefact
            that lets you cite the platform's involvement transparently — not hide it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-4">
          <Feature
            icon={<History className="h-5 w-5" />}
            title="Every agent invocation logged"
            body="Timestamp, agent identity, prompt scope, model version, and output — preserved per job."
          />
          <Feature
            icon={<FileText className="h-5 w-5" />}
            title="Every finding sourced"
            body="Each comment references a verbatim manuscript excerpt with page and section anchors — never floating critique."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Exportable on request"
            body="Download a signed PDF audit record alongside your annotated review — share with your committee, archive with your defense package."
          />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/sample-review" className="inline-flex items-center gap-2 text-[14.5px] text-white underline underline-offset-[6px] decoration-1 hover:decoration-2">
            See a sample audit record <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/academic-integrity" className="inline-flex items-center gap-2 text-[14.5px] text-white/70 hover:text-white">
            Read our academic integrity policy
          </Link>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="col-span-12 md:col-span-4 rounded-xl ring-1 ring-white/15 bg-white/[0.03] p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold text-[16px] text-white">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-[1.65] text-white/75">{body}</p>
    </div>
  );
}
