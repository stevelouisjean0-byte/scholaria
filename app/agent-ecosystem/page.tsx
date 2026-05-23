import Link from "next/link";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { AgentEcosystem } from "@/components/sections/agent-ecosystem";
import { publicAgents } from "@/lib/agents";
import { PAGE_HEROES } from "@/lib/media";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Agent Ecosystem — ten interconnected agents",
  description:
    "Scholaria's autonomous AI agent ecosystem — ten Claude Managed Agents organised in four tiers and coordinated by the Orchestrator through shared workflow memory.",
  alternates: { canonical: "/agent-ecosystem" }
};

const TIER_ORDER = ["core", "review", "operations", "growth"] as const;
const TIER_LABEL: Record<string, string> = {
  core: "Core orchestration",
  review: "Scholarly review",
  operations: "Revenue operations & support",
  growth: "Growth & discovery"
};
const TIER_DESC: Record<string, string> = {
  core: "Intake, routing, and the central conductor that runs the platform end-to-end.",
  review: "The agents that read, critique, and elevate the manuscript itself.",
  operations: "Billing, support, and feedback — handled without a help desk.",
  growth: "Visibility across Google, ChatGPT, and Gemini, optimised continuously."
};

export default function Page() {
  const agents = publicAgents();

  return (
    <>
      <PageMasthead
        number="III"
        eyebrow="AI agent ecosystem"
        title="Ten interconnected agents. One operating system."
        dek="Every agent in Scholaria reads from and writes to a single shared memory document, coordinated by the Orchestrator through durable workflow state."
        photo={PAGE_HEROES.enterprise}
        ctas={[
          { label: "Submit a manuscript", href: "/upload", primary: true },
          { label: "Read how it works", href: "/how-it-works" }
        ]}
      />

      <AgentEcosystem />

      <section className="section">
        <div className="container">
          <div className="max-w-3xl">
            <span className="eyebrow">Reference</span>
            <h2 className="mt-4 h-display text-display-lg">
              Every agent, in detail.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.7] text-ink-600">
              The platform runs the ten agents below. Each is a specialised Claude Managed Agent with its
              own role, responsibilities, and tier. Pricing &amp; QA each carry a backup ID for redundancy
              — they are the two paths where a stuck call would block billing or block delivery.
            </p>
          </div>

          {TIER_ORDER.map((tier) => (
            <section key={tier} className="mt-14">
              <header className="chapter">
                <span className="roman">{romanise(tier)}</span>
                <span className="label">{TIER_LABEL[tier]}</span>
              </header>
              <p className="-mt-6 mb-8 text-[14.5px] text-ink-600 max-w-3xl">{TIER_DESC[tier]}</p>

              <div className="grid grid-cols-12 gap-3">
                {agents
                  .filter((a) => a.tier === tier)
                  .map((a) => (
                    <article key={a.key} className="col-span-12 md:col-span-6 card-quiet p-6">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-semibold text-[16px] text-ink-900">{a.name}</h3>
                        <span className="pill-neutral font-mono">{a.key}</span>
                      </div>
                      <p className="mt-2 text-[14px] leading-[1.65] text-ink-700">{a.publicSummary}</p>
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {a.responsibilities.map((r) => (
                          <li key={r} className="text-[11.5px] text-ink-700 bg-ink-50 ring-1 ring-ink-200 rounded-full px-2 py-0.5">
                            {r}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="section bg-ink-900 text-white">
        <div className="container max-w-4xl">
          <span className="eyebrow text-accent-200">Autonomous revenue operations</span>
          <h2 className="mt-4 h-display text-display-lg text-white">
            A dedicated agent runs your billing without a human in the loop.
          </h2>
          <div className="mt-8 grid grid-cols-12 gap-6">
            {[
              ["Stripe billing", "Subscription creation, upgrades, downgrades, prorations."],
              ["Invoice generation", "Branded invoices issued automatically per cycle."],
              ["Failed payment recovery", "Dunning sequences with smart retry windows."],
              ["Enterprise contracts", "Volume billing, multi-seat, custom net terms."],
              ["QuickBooks sync", "Revenue posted into your books on every event."],
              ["Renewal automation", "Renewals, refunds, and entitlement reconciliation."]
            ].map(([k, v]) => (
              <div key={k as string} className="col-span-12 md:col-span-6 lg:col-span-4">
                <h3 className="text-[15px] font-semibold text-white">{k}</h3>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-white/70">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-white underline underline-offset-[6px] decoration-1 hover:decoration-2 text-[14.5px]">
              See plans & enterprise terms <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function romanise(tier: string): string {
  return { core: "I", review: "II", operations: "III", growth: "IV" }[tier] ?? "·";
}
