"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, FileText, GitBranch, Inbox, Microscope, ShieldCheck, CreditCard, MessageCircle, BarChart, Sparkles } from "lucide-react";

const AGENTS = [
  { key: "intake",     name: "Lead Intake",            tier: "Core",       icon: Inbox },
  { key: "scoping",    name: "Project Scoping & Routing", tier: "Core",   icon: GitBranch },
  { key: "editor",     name: "Professional Editor",    tier: "Review",     icon: FileText },
  { key: "research",   name: "Research Support",       tier: "Review",     icon: Microscope },
  { key: "qa",         name: "QA & Final Approval",    tier: "Review",     icon: ShieldCheck },
  { key: "billing",    name: "Revenue Operations",     tier: "Ops",        icon: CreditCard },
  { key: "support",    name: "Client Support",         tier: "Ops",        icon: MessageCircle },
  { key: "survey",     name: "Survey Completion",      tier: "Ops",        icon: BarChart },
  { key: "seo",        name: "SEO & Growth",           tier: "Growth",     icon: Sparkles }
];

// Polar coordinates around the orchestrator hub.
function point(i: number, n: number, r: number) {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
}

export function AgentEcosystem() {
  return (
    <section className="section bg-canvas">
      <div className="container">
        <div className="grid grid-cols-12 gap-10 items-end">
          <div className="col-span-12 lg:col-span-7">
            <span className="eyebrow">Agentic AI Agent ecosystem</span>
            <h2 className="mt-4 h-display text-display-xl">
              Ten interconnected Agentic AI Agents. One orchestration layer.
            </h2>
          </div>
          <p className="col-span-12 lg:col-span-5 text-[15.5px] leading-[1.7] text-ink-600 lg:pl-8 lg:border-l lg:border-ink-200">
            Scholaria is not a chain of disconnected prompts. The Orchestrator coordinates every
            Agentic AI Agent through shared memory, durable state, and event triggers —
            autonomous execution from intake to delivery, with intelligent multi-step verification
            at every transition.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-7">
            <EcosystemDiagram />
          </div>
          <ul className="col-span-12 lg:col-span-5 space-y-2.5">
            {AGENTS.map((a) => (
              <li key={a.key} className="card-quiet p-4 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white shrink-0">
                  <a.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] text-ink-900 font-medium">{a.name}</span>
                    <span className="pill-neutral whitespace-nowrap">{a.tier}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-[13.5px]">
          <Link href="/agent-ecosystem" className="text-accent-700 hover:text-accent-900 underline underline-offset-[6px] decoration-1 hover:decoration-2">
            Open the full agent reference →
          </Link>
        </p>
      </div>
    </section>
  );
}

function EcosystemDiagram() {
  const radius = 36;
  return (
    <div className="relative aspect-square w-full max-w-[640px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Radial guide */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(23,27,39,.08)" strokeDasharray="0.5 0.6" />

        {/* Connector lines from each agent to the central hub */}
        {AGENTS.map((_, i) => {
          const p = point(i, AGENTS.length, radius);
          return (
            <motion.line
              key={i}
              x1="50" y1="50"
              x2={p.x} y2={p.y}
              stroke="rgba(56,84,209,.35)"
              strokeWidth="0.25"
              strokeDasharray="1 1"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.04, ease: "easeOut" }}
            />
          );
        })}

        {/* Animated data flow along one line at a time (cosmetic) */}
        <motion.circle
          r="0.7"
          fill="#3854d1"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }}
        >
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M50,50 L86,50 M50,50 L50,86 M50,50 L14,50 M50,50 L50,14" />
        </motion.circle>

        {/* Central orchestrator hub */}
        <circle cx="50" cy="50" r="9" fill="#0b0e16" />
        <circle cx="50" cy="50" r="9" fill="none" stroke="rgba(56,84,209,.5)" strokeWidth="0.3">
          <animate attributeName="r" values="9;12;9" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* HTML overlay for the agent nodes + central label so type stays crisp */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central orchestrator label */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/70">Orchestrator</div>
          <div className="mt-1 inline-flex items-center gap-1 text-white">
            <Brain className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">shared memory</span>
          </div>
        </div>

        {AGENTS.map((a, i) => {
          const p = point(i, AGENTS.length, radius);
          // Flip text to the outside of the circle so labels don't collide
          const onLeft = p.x < 50;
          return (
            <motion.div
              key={a.key}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.04, duration: 0.4 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div className="flex items-center gap-2">
                {!onLeft && <NodeChip name={a.name} icon={a.icon} />}
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-ink-200 shadow-elev1 text-ink-900">
                  <a.icon className="h-3.5 w-3.5" />
                </span>
                {onLeft && <NodeChip name={a.name} icon={a.icon} />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function NodeChip({ name }: { name: string; icon: any }) {
  return (
    <span className="hidden md:inline-flex items-center text-[11px] text-ink-700 bg-white ring-1 ring-ink-200 rounded-full px-2 py-0.5 shadow-elev1 whitespace-nowrap">
      {name}
    </span>
  );
}
