import Link from "next/link";
import { Check, X, Minus, ArrowUpRight } from "lucide-react";

type Cell = boolean | "partial" | string;

export interface CompetitorRow {
  capability: string;
  us: Cell;
  them: Cell;
}

export interface CompetitorComparisonProps {
  competitorName: string;
  competitorPrice: string;
  ourPrice?: string;
  tagline: string;
  intro: string;
  rows: CompetitorRow[];
  verdict: string;
  switchCta?: string;
}

export function CompetitorComparison({
  competitorName,
  competitorPrice,
  ourPrice = "$0 free trial, $49–$299/mo",
  tagline,
  intro,
  rows,
  verdict,
  switchCta = `See a sample review`
}: CompetitorComparisonProps) {
  return (
    <>
      <section className="section">
        <div className="container max-w-4xl">
          <div className="eyebrow">Comparison</div>
          <h2 className="mt-3 h-display text-display-md">{tagline}</h2>
          <p className="mt-5 text-[15.5px] leading-[1.7] text-ink-700">{intro}</p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-[14px] min-w-[640px]">
              <thead>
                <tr className="text-left">
                  <th className="py-4 pr-4 text-[11px] uppercase tracking-[0.22em] text-ink-500 font-medium">
                    Capability
                  </th>
                  <th className="py-4 pr-4 text-center w-44">
                    <div className="text-ink-900 font-semibold">Dissertation Editing Center</div>
                    <div className="text-[11.5px] text-ink-500 font-normal mt-0.5">{ourPrice}</div>
                  </th>
                  <th className="py-4 pr-4 text-center w-44">
                    <div className="text-ink-700 font-medium">{competitorName}</div>
                    <div className="text-[11.5px] text-ink-500 font-normal mt-0.5">{competitorPrice}</div>
                  </th>
                </tr>
              </thead>
              <tbody className="border-t border-ink-200">
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-ink-100">
                    <td className="py-4 pr-4 align-top text-ink-900">{row.capability}</td>
                    <td className="py-4 pr-4 text-center align-top bg-emerald-50/30">
                      <CellMark v={row.us} />
                    </td>
                    <td className="py-4 pr-4 text-center align-top">
                      <CellMark v={row.them} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 card-quiet p-6">
            <div className="eyebrow">Honest verdict</div>
            <p className="mt-3 text-[15px] leading-[1.7] text-ink-800">{verdict}</p>
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="container py-16 max-w-3xl text-center">
          <h2 className="font-serif text-[32px] lg:text-[40px] leading-tight text-white balance">
            See a real review side-by-side, then choose your plan.
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sample-review"
              className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-white text-ink-900 text-[14px] font-medium hover:bg-ink-100 transition"
            >
              {switchCta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full ring-1 ring-white/30 text-white text-[14px] font-medium hover:bg-white/10 transition"
            >
              Compare plans
            </Link>
          </div>
          <p className="mt-5 text-[12.5px] text-white/60">
            14-day money-back guarantee · Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}

function CellMark({ v }: { v: Cell }) {
  if (v === true)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-700/15 text-emerald-700">
        <Check className="h-4 w-4" />
      </span>
    );
  if (v === false)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-50 ring-1 ring-ink-200 text-ink-400">
        <X className="h-4 w-4" />
      </span>
    );
  if (v === "partial")
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] uppercase tracking-[0.18em] text-amber-700 font-medium">
        <Minus className="h-3 w-3" />
        Partial
      </span>
    );
  return <span className="text-[13px] text-ink-700">{v}</span>;
}
