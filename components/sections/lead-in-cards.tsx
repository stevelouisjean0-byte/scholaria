import Link from "next/link";
import { Brain, Network, FileCheck2, ArrowUpRight } from "lucide-react";

const CARDS = [
  {
    href: "/dissertation-intelligence",
    icon: Brain,
    eyebrow: "The product",
    title: "Dissertation Intelligence",
    body:
      "The operating system for doctoral writing — nine examinations, decomposed scores, and an editorial pipeline that runs without human routing."
  },
  {
    href: "/agent-ecosystem",
    icon: Network,
    eyebrow: "The platform",
    title: "AI Agent Ecosystem",
    body:
      "Eleven Claude-managed agents coordinated through shared memory and durable workflow state. Every agent is named, audited, and replaceable."
  },
  {
    href: "/how-it-works",
    icon: FileCheck2,
    eyebrow: "The pipeline",
    title: "How it works",
    body:
      "From upload to delivery, every step is an agent. Eleven durable transitions. QA-gated. No human in the loop, by design."
  }
];

export function LeadInCards() {
  return (
    <section className="section">
      <div className="container">
        <div className="max-w-3xl">
          <span className="eyebrow">Where to go next</span>
          <h2 className="mt-4 h-display text-display-lg">
            Three doors into the platform.
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.65] text-ink-600">
            The homepage is deliberately brief. Open any of these for the full editorial brief on what the
            product does, who runs it, and how a manuscript moves through the pipeline.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-4">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="col-span-12 md:col-span-4 group card-quiet p-7 hover:shadow-elev3 hover:ring-ink-300 transition"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <c.icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-ink-400 group-hover:text-ink-900 transition" />
              </div>
              <div className="mt-6 eyebrow">{c.eyebrow}</div>
              <h3 className="mt-2 font-semibold text-[22px] text-ink-900 leading-snug">{c.title}</h3>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-600">{c.body}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-ink-900 group-hover:underline underline-offset-[6px] decoration-1">
                Open page
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
