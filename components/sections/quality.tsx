const ITEMS: [string, string][] = [
  ["Explicit, verbatim findings", "Every comment references the exact passage with page, section, and severity — verifiable, never vague."],
  ["Human-grade prose", "Editing recommendations are written to read as a senior consultant would write them. Generic AI patterns are explicitly suppressed by the QA agent."],
  ["Scholarly register", "Tone is calibrated for committees, chairs, and peer reviewers — not generic SaaS friendliness."],
  ["No ghostwriting", "Scholaria validates, edits, and guides. It does not author your dissertation. That is the architectural first principle."],
  ["Reproducible scores", "Submission readiness and tone scores are decomposed so you can see what would move the number — precision and consistency over opaque metrics."],
  ["Audit trail", "Every agent invocation, finding, and revision is durable, replayable, and exportable — defensible to your committee."]
];

export function QualityFeatures() {
  return (
    <section className="section bg-paper">
      <div className="container">
        <header className="chapter">
          <span className="roman">V.</span>
          <span className="label">Editorial principles</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Publication-quality output — every finding sourced and verifiable.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            Every output passes intelligent multi-step verification before it reaches you — designed
            to reduce human error and improve scholarly accuracy from the first finding to the final
            delivery email.
          </p>
        </div>

        <dl className="mt-14 grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
          {ITEMS.map(([t, b]) => (
            <div key={t} className="col-span-12 md:col-span-6 grid grid-cols-12 gap-4 py-8 border-b border-ink-200">
              <dt className="col-span-12 md:col-span-5 font-serif text-[20px] leading-tight text-ink-900">{t}</dt>
              <dd className="col-span-12 md:col-span-7 text-[14.5px] leading-[1.7] text-ink-700">{b}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
