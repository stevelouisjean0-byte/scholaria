import { ArrowRight } from "lucide-react";

const EXAMPLES = [
  {
    tag: "Synthesis · Chapter 2 · p. 12",
    before:
      "Transformational leadership theory was foundational in this study, and the literature reviewed broadly supports the themes discussed.",
    after:
      "The transition between the theoretical framework and the literature review lacks sufficient scholarly connection. Consider adding a paragraph that explicitly explains how transformational leadership theory informs each theme discussed in §2.4 through §2.7.",
    label: "Professional Editor Agent"
  },
  {
    tag: "Citation · Chapter 2 · p. 17",
    before: "Participation rates improved significantly following the intervention (Reyes, 2022).",
    after:
      "The citation on page 17 appears within the narrative but is absent from the reference section. Verify APA 7 requirements and include the complete reference entry.",
    label: "Research Support Agent"
  },
  {
    tag: "Methodology · Chapter 3 · §3.4",
    before: "Research Question 2 examines whether transformational leadership practices differ across cohorts.",
    after:
      "RQ2 is framed comparatively across cohorts, but the sampling described in §3.4 is purposive within a single site. Either widen the sampling strategy to include a comparison site or reframe RQ2 as a single-site inquiry into within-cohort variation.",
    label: "Research Support Agent"
  }
];

export function BeforeAfter() {
  return (
    <section className="section">
      <div className="container">
        <div className="max-w-3xl">
          <span className="eyebrow">Before & after</span>
          <h2 className="mt-4 h-display text-display-xl">
            The kind of feedback your committee will actually trust.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-ink-600">
            Every finding references a verbatim excerpt from the manuscript and is paired with an explicit,
            actionable recommendation. No vague critique. No generic phrases.
          </p>
        </div>

        <div className="mt-14 space-y-4">
          {EXAMPLES.map((e, i) => (
            <article key={i} className="card-quiet overflow-hidden">
              <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between text-[12px] text-ink-500 bg-ink-50/40">
                <span className="font-medium">{e.tag}</span>
                <span className="pill-accent">{e.label}</span>
              </div>
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink-100">
                <div className="p-6">
                  <div className="text-[10.5px] uppercase tracking-[0.24em] text-ink-500 mb-2">Manuscript excerpt</div>
                  <p className="font-serif italic text-[16px] leading-[1.55] text-ink-900 balance">“{e.before}”</p>
                </div>
                <div className="p-6 bg-ink-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-3.5 w-3.5 text-accent-500" />
                    <span className="text-[10.5px] uppercase tracking-[0.24em] text-accent-700">Scholaria recommendation</span>
                  </div>
                  <p className="text-[14.5px] leading-[1.65] text-ink-800">{e.after}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
