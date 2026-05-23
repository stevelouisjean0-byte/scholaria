const ITEMS: [string, string][] = [
  ["Explicit, verbatim findings", "Every comment references the exact passage with page, section, and severity — never vague critique."],
  ["Human-grade prose", "Editing recommendations are written to read as a senior consultant would write them. AI-detection patterns are explicitly suppressed."],
  ["Scholarly register", "Tone is calibrated for committees, chairs, and peer reviewers — not generic SaaS friendliness."],
  ["No ghostwriting", "Scholaria critiques, edits, and guides. It does not author your dissertation. That is the point."],
  ["Reproducible scores", "Submission readiness and tone scores are decomposed so you can see what would move the number."],
  ["Audit trail", "Every agent invocation, finding, and revision is durable, replayable, and exportable."]
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
            Publication-quality, every time. By design.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            The platform is engineered so the output never feels generic, robotic, or template-driven —
            from the first finding to the final delivery email.
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
