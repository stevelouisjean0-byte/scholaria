const ENTRIES = [
  ["Literature review intelligence", "Thematic coherence, synthesis depth, and the transitions between theory and evidence — read paragraph by paragraph."],
  ["Citation verification", "Every in-text citation matched to the reference list. Missing, malformed, and orphaned entries flagged with page numbers."],
  ["APA 7 formatting", "Headings, levels, in-text patterns, DOI structure, hanging indents, title case — verified against the current APA 7 specification."],
  ["Methodology alignment", "Research questions, design, sampling, and analysis examined against the stated theoretical framework."],
  ["Scholarly tone scoring", "Tone, register, hedging, and discipline-appropriate voice scored across the manuscript and per section."],
  ["Revision plans", "Findings converted into an ordered, prioritised plan a student can act on the same evening."],
  ["Originality assistance", "Turnitin-style overlap signals and paraphrase guidance — without ever rewriting the dissertation."],
  ["Submission readiness", "A single 0–100 number that committees recognise, decomposed so the underlying components are visible."]
];

export function DissertationFeatures() {
  return (
    <section className="section">
      <div className="container">
        <header className="chapter">
          <span className="roman">III.</span>
          <span className="label">What is examined</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Eight passes across every manuscript.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            Each pass is performed by the Agentic AI Agent best suited to it and merged into a
            single canonical revision document through intelligent multi-step verification. None
            of them rewrite your work — they tell you, precisely, what to revise.
          </p>
        </div>

        {/* No cards. No icons. Just a numbered editorial register that reads like
            the front matter of an article. Inspired by Annual Reviews and JAMA. */}
        <ol className="mt-16 grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
          {ENTRIES.map(([title, body], i) => (
            <li key={title} className="col-span-12 md:col-span-6 grid grid-cols-12 gap-4 py-8 border-b border-ink-200">
              <span className="col-span-2 md:col-span-2 font-mono tabular text-[12px] text-ink-500 pt-1">
                §{String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-10 md:col-span-10">
                <h3 className="font-serif text-[22px] leading-tight text-ink-900">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-700 max-w-prose">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Pull quote — pulls the reader through to the next section. */}
        <div className="asterism" aria-hidden>* * *</div>
        <p className="font-serif italic text-[22px] lg:text-[28px] leading-[1.45] text-ink-900 max-w-4xl mx-auto text-center balance">
          “The transition between the theoretical framework and literature review lacks sufficient
          scholarly connection. Consider adding a paragraph that explicitly explains how transformational
          leadership theory informs the themes discussed throughout the literature synthesis.”
        </p>
        <p className="text-center text-[12.5px] uppercase tracking-[0.28em] text-ink-500 mt-4">
          Excerpt · Professional Editor Agent · Chapter 2 · Page 12
        </p>
      </div>
    </section>
  );
}
