/* Replaced the browser-chrome SaaS mockup with a Figure 1.-style composition:
   marginalia annotations on the left, a typeset passage in the middle, and
   editorial score table at the right. No window controls, no "live" dot. */

const ANNOTATIONS = [
  { tag: "tone", note: "Strengthen the scholarly register in the opening sentence.", anchor: "para 1" },
  { tag: "synthesis", note: "Theoretical framework disappears here — bridge before §2.4.", anchor: "para 2" },
  { tag: "citation", note: "Citation present in narrative but absent from reference list.", anchor: "p. 17" },
  { tag: "structure", note: "Heading demoted from L3 to L4 — verify hierarchy.", anchor: "§2.5" }
];

export function DashboardPreview() {
  return (
    <section className="section">
      <div className="container">
        <header className="chapter">
          <span className="roman">IV.</span>
          <span className="label">Excerpts from reviews</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            What the agents actually return.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            A reproduction of a single page from a doctoral review. Margins carry the reviewing agent's
            annotations, the typeset passage carries the manuscript, the side column carries the scores.
          </p>
        </div>

        {/* Figure block — proportioned like a journal plate. */}
        <figure className="mt-14 border-y border-ink-900/90 py-10">
          <div className="grid grid-cols-12 gap-8">
            {/* Marginalia — annotations from the reviewing agent. */}
            <aside className="col-span-12 lg:col-span-3 order-2 lg:order-1">
              <div className="eyebrow">Marginalia</div>
              <ul className="mt-4 space-y-5">
                {ANNOTATIONS.map((a) => (
                  <li key={a.tag} className="border-l border-ink-300 pl-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500">{a.tag} · {a.anchor}</div>
                    <p className="mt-1 font-serif italic text-[14.5px] leading-[1.55] text-ink-800">{a.note}</p>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Typeset passage — the manuscript page itself. */}
            <article className="col-span-12 lg:col-span-6 order-1 lg:order-2">
              <div className="eyebrow">From the manuscript</div>
              <h3 className="mt-3 font-serif text-[26px] leading-tight text-ink-900 balance">
                Transformational Leadership and Adaptive Capacity in Hybrid Schools
              </h3>
              <p className="mt-2 text-[12.5px] text-ink-500 italic">
                Patel, M. — Doctoral candidate · Ed.D. · Chapter 2 · Page 12 of 41
              </p>
              <div className="mt-7 space-y-5 font-serif text-[17.5px] leading-[1.75] text-ink-900 max-w-prose">
                <p>
                  Although the framework introduced in Chapter 1 anchors the inquiry in
                  transformational leadership theory, the present chapter shifts to a thematic
                  treatment of empirical studies without re-stating how the framework should
                  organise the synthesis that follows.
                </p>
                <p>
                  The themes presented in §2.4 and §2.6 perform similar analytical work and are
                  labelled differently; consolidation would tighten the chapter and remove the
                  appearance of redundancy that a committee will notice before any reviewer can
                  defend it.
                </p>
                <p>
                  A citation introduced on page 17 of the original manuscript appears in the
                  narrative without a corresponding entry in the reference section. Verify the
                  APA 7 requirements and reinstate the full reference.
                </p>
              </div>
            </article>

            {/* Score column — set as a small printed table. */}
            <aside className="col-span-12 lg:col-span-3 order-3">
              <div className="eyebrow">Scores</div>
              <table className="mt-4 w-full text-[14px]">
                <tbody className="divide-y divide-ink-200">
                  {[
                    ["Scholarly tone", 86],
                    ["APA 7 compliance", 91],
                    ["Synthesis depth", 78],
                    ["Methodology alignment", 84],
                    ["Citation accuracy", 88]
                  ].map(([k, v]) => (
                    <tr key={k as string}>
                      <td className="py-2.5 text-ink-700">{k}</td>
                      <td className="py-2.5 text-right font-serif text-ink-900 tabular">{v}<span className="text-ink-400 text-[12px]">/100</span></td>
                    </tr>
                  ))}
                  <tr className="bg-ink-900 text-white">
                    <td className="py-2.5 px-2 text-[12.5px] uppercase tracking-[0.2em]">Submission readiness</td>
                    <td className="py-2.5 px-2 text-right font-serif text-2xl tabular">92</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-[12px] text-ink-500 italic">
                Committee-ready with minor revisions.
              </p>
            </aside>
          </div>
        </figure>

        <figcaption className="text-[12.5px] uppercase tracking-[0.24em] text-ink-500 mt-4">
          Figure 1. — Excerpt from a doctoral review. Names and identifying details anonymised.
        </figcaption>
      </div>
    </section>
  );
}
