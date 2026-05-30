"use client";
import { motion } from "framer-motion";

const STEPS = [
  ["01", "Manuscript uploaded", "PDF or DOCX is received over an encrypted channel, hashed, and registered in the job ledger."],
  ["02", "Lead Intake Agent", "Captures degree level, paper type, deadline, formatting style, professor feedback, and stated concerns."],
  ["03", "Project Scoping & Routing", "Scores academic complexity, classifies the paper, and selects the precise validation path and priority tier."],
  ["04", "Orchestrator Agent", "Assigns reviewing agents, maintains the shared memory document, and drives deterministic state transitions."],
  ["05", "Validation in parallel", "Professional Editor and Research Support Agents validate the manuscript independently and post explicit, verifiable findings."],
  ["06", "Shared memory merge", "Findings are deduplicated, ranked by severity, and merged into a single canonical revision document."],
  ["07", "QA & Final Approval", "Intelligent multi-step verification, scored submission readiness, and rejection of any review that is not actionable."],
  ["08", "Final scholarly package", "Executive summary, annotated document, APA report, citation verification, and a downloadable revision package."],
  ["09", "Automatic delivery", "The student is notified in a calm, scholarly voice with their report, scores, and recommended next steps."]
] as const;

export function Workflow() {
  return (
    <section className="section bg-paper grain">
      <div className="container">
        <header className="chapter">
          <span className="roman">II.</span>
          <span className="label">How a manuscript moves</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            From upload to publication-quality package — autonomous execution, no manual hand-off.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            Every step below is executed by a named agent. Every transition is durable. Every
            output passes a QA gate before it ever reaches a candidate.
          </p>
        </div>

        {/* Editorial rail: a single vertical line on the left at lg+, with the
            step number and a tick mark anchoring each row. Reads as a printed
            programme rather than a card grid. */}
        <ol className="mt-16 relative lg:pl-10">
          <span
            aria-hidden
            className="hidden lg:block absolute left-3 top-2 bottom-2 w-px bg-ink-200"
          />
          {STEPS.map(([n, title, body], i) => (
            <motion.li
              key={n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.03 }}
              className="relative grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-2 py-7 border-b border-ink-200/70 last:border-b-0"
            >
              <span
                aria-hidden
                className="hidden lg:block absolute -left-[34px] top-9 h-2 w-2 rounded-full bg-ink-900 ring-4 ring-paper"
              />
              <div className="lg:col-span-2 flex items-baseline gap-3">
                <span className="font-mono text-[11.5px] tracking-widest text-ink-400 tabular">{n}</span>
              </div>
              <div className="lg:col-span-4">
                <h3 className="font-serif text-[20px] leading-snug text-ink-900">{title}</h3>
              </div>
              <p className="lg:col-span-6 text-[14.5px] leading-7 text-ink-600 max-w-prose">{body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
