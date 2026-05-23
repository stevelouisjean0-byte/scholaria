/* Replaced the SaaS "logos row" with a pull quote — a more editorial way to
   establish credibility on a scholarly publication. */
export function Trusted() {
  return (
    <section className="bg-paper border-y border-ink-200">
      <div className="container py-16 lg:py-20 grid grid-cols-12 gap-10 items-end">
        <div className="col-span-12 lg:col-span-2 eyebrow">Editor's note</div>
        <blockquote className="col-span-12 lg:col-span-8 font-serif italic text-[22px] lg:text-[26px] leading-[1.45] text-ink-900 balance">
          “Scholaria was designed for the candidates whose chair will read the margin notes — not for the
          ones looking for a faster answer. Every finding is anchored to a passage; every score is
          decomposed; nothing is released that reads as boilerplate.”
        </blockquote>
        <div className="col-span-12 lg:col-span-2 text-[12.5px] text-ink-500 lg:text-right">
          Editorial desk, 2026
        </div>
      </div>
    </section>
  );
}
