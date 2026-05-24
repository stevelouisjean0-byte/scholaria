import Link from "next/link";
import { PLANS } from "@/lib/plans";

export function PricingPreview() {
  const tiers = PLANS;

  return (
    <section className="section bg-paper">
      <div className="container">
        <header className="chapter">
          <span className="roman">VII.</span>
          <span className="label">Rates &amp; access</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            A rate card written for academic timelines.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            Every tier runs on the same Agentic AI Agent ecosystem. Higher tiers unlock more
            reviewing agents, faster autonomous execution, deeper intelligent verification, and the
            cross-chapter coherence required for full-dissertation work.
          </p>
        </div>

        {/* Set as a printed rate card — single table, hairlines between rows.
            No card stacks, no glossy badges. */}
        <div className="mt-14 overflow-x-auto">
          <table className="w-full text-[14px] border-t border-ink-900/90">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-[0.22em] text-ink-500">
                <th className="py-4 pr-6 font-medium">Tier</th>
                <th className="py-4 pr-6 font-medium">Audience</th>
                <th className="py-4 pr-6 font-medium">Turnaround</th>
                <th className="py-4 pr-6 font-medium">Volume</th>
                <th className="py-4 pr-6 font-medium">Rate</th>
                <th className="py-4 font-medium text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {tiers.map((p) => (
                <tr key={p.id} className={p.recommended ? "bg-white" : ""}>
                  <td className="py-6 pr-6 align-top">
                    <div className="font-serif text-[20px] text-ink-900 flex items-center gap-3">
                      {p.name}
                      {p.recommended && (
                        <span className="text-[10.5px] uppercase tracking-[0.28em] text-ink-500 italic">recommended</span>
                      )}
                    </div>
                    <p className="mt-1 text-[12.5px] text-ink-500 max-w-[22ch]">{p.positioning}</p>
                  </td>
                  <td className="py-6 pr-6 align-top text-ink-700">{p.audience}</td>
                  <td className="py-6 pr-6 align-top text-ink-700">{p.turnaround}</td>
                  <td className="py-6 pr-6 align-top text-ink-700">{p.uploadLimit}</td>
                  <td className="py-6 pr-6 align-top">
                    <div className="font-serif text-[24px] text-ink-900 tabular">
                      {p.priceMonthly === 0 ? "Free" : p.priceMonthly === null ? "By arrangement" : `$${p.priceMonthly}`}
                    </div>
                    {p.priceMonthly ? (
                      <div className="text-[12px] text-ink-500">per month{p.priceAnnual ? ` · $${p.priceAnnual} annual` : ""}</div>
                    ) : null}
                  </td>
                  <td className="py-6 align-top text-right">
                    <Link
                      href={p.cta.href}
                      className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2 whitespace-nowrap"
                    >
                      {p.cta.label} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[12.5px] italic text-ink-500 max-w-3xl">
          Institutional and university rates are arranged with the enterprise desk. Free trial reviews are
          single-pass and word-limited; longer manuscripts are received under a paid tier.
        </p>
      </div>
    </section>
  );
}
