"use client";
import { motion } from "framer-motion";
import {
  Upload, Inbox, GitBranch, Activity, Brain, Quote,
  Microscope, ShieldCheck, CreditCard, FileBarChart2, LayoutDashboard
} from "lucide-react";

const STEPS = [
  { n: "01", icon: Upload,         title: "Student uploads dissertation",   detail: "PDF or DOCX received over an encrypted channel and registered." },
  { n: "02", icon: Inbox,          title: "AI Intake Agent processes submission", detail: "Degree level, paper type, deadline, formatting style, concerns captured." },
  { n: "03", icon: GitBranch,      title: "Routing Agent determines workflow", detail: "Academic complexity scored, service track selected, priority assigned." },
  { n: "04", icon: Activity,       title: "Orchestrator assigns AI review agents", detail: "Reviewing agents activated against the shared workflow memory." },
  { n: "05", icon: Brain,          title: "Dissertation intelligence analysis runs", detail: "Tone, clarity, structure, and scholarly register evaluated." },
  { n: "06", icon: Quote,          title: "APA & citation validation",       detail: "Every in-text citation matched to its reference list entry." },
  { n: "07", icon: Microscope,     title: "Methodology review",              detail: "Research questions, design, sampling, and analysis examined for alignment." },
  { n: "08", icon: ShieldCheck,    title: "Quality assurance",               detail: "QA agent rejects anything that reads as generic or non-actionable." },
  { n: "09", icon: CreditCard,     title: "Billing & subscription verification", detail: "Revenue Ops agent verifies entitlement and reconciles usage." },
  { n: "10", icon: FileBarChart2,  title: "Final scholarly report generated", detail: "Annotated document, APA report, revision plan, readiness score." },
  { n: "11", icon: LayoutDashboard, title: "Student dashboard updated",     detail: "Findings, scores, and downloads delivered without human intervention." }
];

export function WorkflowViz() {
  return (
    <section className="section">
      <div className="container">
        <div className="max-w-3xl">
          <span className="eyebrow">Autonomous workflow</span>
          <h2 className="mt-4 h-display text-display-xl">
            Eleven steps, every one run by an agent.
          </h2>
          <p className="mt-5 text-[16.5px] leading-[1.65] text-ink-600">
            From the moment a manuscript is uploaded to the moment the dashboard updates, the platform
            runs end-to-end without human routing, QA, billing, or delivery.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-12 gap-3 lg:gap-4">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.03 }}
              className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 group"
            >
              <div className="card-quiet h-full p-5 hover:ring-ink-300 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-widest text-ink-400 tabular">{s.n}</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white">
                    <s.icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-[15px] text-ink-900 leading-snug">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-ink-600">{s.detail}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
