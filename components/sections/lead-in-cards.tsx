import Link from "next/link";
import { Brain, Network, FileCheck2, ArrowUpRight } from "lucide-react";

const CARDS = [
  {
    href: "/dissertation-intelligence",
    icon: Brain,
    eyebrow: "The product",
    title: "Dissertation Intelligence",
    body:
      "An Agentic AI operating system for doctoral research — nine intelligent examinations and a validation pipeline designed to reduce human error and improve scholarly accuracy."
  },
  {
    href: "/agent-ecosystem",
    icon: Network,
    eyebrow: "The platform",
    title: "Agentic AI Agent Ecosystem",
    body:
      "Eleven Claude-managed Agentic AI Agents coordinated through shared memory and durable workflow state. Each agent is auditable, deterministic, and built for precision-driven validation."
  },
  {
    href: "/how-it-works",
    icon: FileCheck2,
    eyebrow: "The pipeline",
    title: "How it works",
    body:
      "Autonomous execution from upload to delivery. Eleven QA-gated transitions, intelligent multi-step verification, and zero routing overhead — by architecture, not by promise."
  }
];

export function LeadInCards() {
  return (
    <section className="section">
      <div className="container">
        <div className="max-w-3xl">
          <span className="eyebrow">Where to go next</span>
          <h2 className="mt-4 h-display text-display-lg">
            Three doors into the operating system.
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.65] text-ink-600">
            The homepage is deliberately brief. Open any of these for the full architectural brief
            on what the platform validates, how the Agentic AI Agents coordinate, and how a
            manuscript moves through autonomous review.
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
