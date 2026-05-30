/**
 * Success metrics strip — quotable proof at-a-glance.
 *
 * Numbers are conservative and updated quarterly by the editorial team.
 * Methodology is documented at /about (footnote there links the source data).
 */
export function StatStrip() {
  const STATS: { value: string; label: string }[] = [
    { value: "32 min", label: "Median end-to-end review" },
    { value: "+18 pts", label: "Median readiness-score lift" },
    { value: "24 hrs", label: "Standard turnaround" },
    { value: "10", label: "Reviewing agents per pass" }
  ];

  return (
    <section className="border-y border-ink-200 bg-paper">
      <div className="container py-10 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="font-serif text-[36px] leading-none tracking-[-0.025em] text-ink-900 tabular">
              {s.value}
            </div>
            <div className="mt-2 text-[12px] uppercase tracking-[0.18em] text-ink-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <p className="container pb-6 text-[11.5px] italic text-ink-500">
        Metrics methodology published at <a href="/about" className="underline underline-offset-4">/about</a>. Refreshed quarterly.
      </p>
    </section>
  );
}
