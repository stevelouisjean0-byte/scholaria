const SCORES = [
  { k: "Scholarly tone", v: 86, hint: "Register, hedging, discipline-appropriate voice" },
  { k: "APA 7 compliance", v: 91, hint: "Headings, citations, references, DOIs" },
  { k: "Synthesis depth", v: 78, hint: "How sources speak to each other" },
  { k: "Methodology alignment", v: 84, hint: "Questions, design, sampling, analysis" },
  { k: "Citation accuracy", v: 88, hint: "In-text → reference list cross-check" },
  { k: "Clarity & cadence", v: 82, hint: "Sentence rhythm, transitions" }
];

export function ScoringPreview() {
  return (
    <section className="section bg-paper">
      <div className="container">
        <div className="grid grid-cols-12 gap-10 items-end">
          <div className="col-span-12 lg:col-span-7">
            <span className="eyebrow">Dissertation readiness</span>
            <h2 className="mt-4 h-display text-display-xl">
              A single 0–100 number your committee already trusts.
            </h2>
          </div>
          <p className="col-span-12 lg:col-span-5 text-[15.5px] leading-[1.7] text-ink-600 lg:pl-8 lg:border-l lg:border-ink-200">
            Submission readiness is decomposed so the underlying components are visible. You see exactly
            what would move the number, ranked by impact.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <div className="card-dark p-8 lg:p-10 h-full flex flex-col justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/60">Submission readiness</div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-semibold tabular text-7xl text-white">84</span>
                  <span className="text-white/50 text-2xl">/100</span>
                </div>
                <p className="mt-3 font-serif italic text-white/80 text-[16px]">
                  Committee-ready with minor revisions.
                </p>
              </div>
              <div className="mt-10 pt-6 border-t border-white/10 text-[12.5px] text-white/70">
                <div>Validated by QA &amp; Final Approval Agent · 02:14 ago</div>
                <div className="mt-1">Issued · 2 major · 3 moderate · 2 minor</div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 card-quiet p-6 lg:p-8">
            <div className="text-[11px] uppercase tracking-[0.24em] text-ink-500">Score breakdown</div>
            <ul className="mt-4 divide-y divide-ink-100">
              {SCORES.map((s) => (
                <li key={s.k} className="py-3.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[14px] text-ink-900 font-medium">{s.k}</span>
                    <span className="tabular font-semibold text-ink-900">{s.v}<span className="text-ink-400 text-[12px]">/100</span></span>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full bg-ink-900" style={{ width: `${s.v}%` }} />
                  </div>
                  <div className="mt-1.5 text-[12px] text-ink-500">{s.hint}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
